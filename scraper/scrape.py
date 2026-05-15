"""Fetch all HEI Network episodes via WordPress REST API and write data/timeline.json."""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests

# --- config -----------------------------------------------------------------

BASE = "https://www.heinetwork.tv/wp-json/wp/v2/episode"
PER_PAGE = 100
HEADERS = {
    "User-Agent": "hei-timeline-scraper/1.0 (+https://github.com/)",
    "Accept": "application/json",
}
SKIP_COMING_SOON = True

# Parent directory of this file -> project root
ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT / "data" / "timeline.json"

SEASON_NUM_RE = re.compile(r"season\s+(\d+)", re.IGNORECASE)


def parse_air_date(raw: Any, fallback_wp_date: str) -> str:
    """Normalize to YYYY-MM-DD."""
    if isinstance(raw, str) and len(raw) == 8 and raw.isdigit():
        return f"{raw[:4]}-{raw[4:6]}-{raw[6:8]}"
    # WP date is like "2026-03-15T14:52:50"
    if fallback_wp_date and len(fallback_wp_date) >= 10:
        return fallback_wp_date[:10]
    return "1970-01-01"


def category_from_link(link: str) -> str | None:
    try:
        path = urlparse(link).path.strip("/").split("/")
        return path[0] if path and path[0] else None
    except Exception:
        return None


def poster_url(ep: dict[str, Any]) -> str | None:
    emb = ep.get("_embedded") or {}
    media = emb.get("wp:featuredmedia") or []
    if media and isinstance(media[0], dict):
        return media[0].get("source_url")
    return None


def season_from_embedded(ep: dict[str, Any]) -> tuple[str | None, int | None]:
    emb = ep.get("_embedded") or {}
    terms = emb.get("wp:term") or []
    for group in terms:
        if not isinstance(group, list):
            continue
        for term in group:
            if not isinstance(term, dict):
                continue
            if term.get("taxonomy") != "season":
                continue
            name = term.get("name") or ""
            m = SEASON_NUM_RE.search(name)
            num = int(m.group(1)) if m else None
            return name, num
    return None, None


def transform(ep: dict[str, Any]) -> dict[str, Any]:
    acf = ep.get("acf") or {}
    title_html = (ep.get("title") or {}).get("rendered") or ""
    # Decode common HTML entities minimally (WP sometimes returns &amp; etc.)
    title = (
        title_html.replace("&#8217;", "'")
        .replace("&#8216;", "'")
        .replace("&amp;", "&")
        .replace("&quot;", '"')
        .strip()
    )
    link = ep.get("link") or ""
    season_name, season_number = season_from_embedded(ep)

    return {
        "id": ep.get("id"),
        "title": title,
        "slug": ep.get("slug") or "",
        "url": link,
        "air_date": parse_air_date(acf.get("air_date"), ep.get("date") or ""),
        "poster_url": poster_url(ep),
        "category": category_from_link(link),
        "season_name": season_name,
        "season_number": season_number,
        "is_live": bool(acf.get("live_episode")),
        "is_coming_soon": bool(acf.get("coming_soon")),
        "length": acf.get("length") or None,
        "youtube_url": acf.get("youtube_url") or None,
    }


def fetch_page(session: requests.Session, page: int) -> tuple[list[dict[str, Any]], int]:
    r = session.get(
        BASE,
        params={
            "per_page": PER_PAGE,
            "page": page,
            "_embed": "1",
        },
        headers=HEADERS,
        timeout=60,
    )
    r.raise_for_status()
    total_pages = int(r.headers.get("X-WP-TotalPages", "1"))
    return r.json(), total_pages


def main() -> int:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    all_raw: list[dict[str, Any]] = []
    with requests.Session() as session:
        # Avoid broken HTTP(S)_PROXY from env causing 403 CONNECT failures
        session.trust_env = False
        page = 1
        total_pages = 1
        while page <= total_pages:
            batch, total_pages = fetch_page(session, page)
            all_raw.extend(batch)
            print(f"Fetched page {page}/{total_pages} ({len(batch)} items)", file=sys.stderr)
            page += 1

    items: list[dict[str, Any]] = []
    for ep in all_raw:
        acf = ep.get("acf") or {}
        if SKIP_COMING_SOON and acf.get("coming_soon"):
            continue
        try:
            items.append(transform(ep))
        except Exception as e:  # noqa: BLE001
            print(f"Skip malformed episode id={ep.get('id')}: {e}", file=sys.stderr)

    items.sort(key=lambda x: x["air_date"], reverse=True)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "items": items,
    }
    OUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} items to {OUT_PATH}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
