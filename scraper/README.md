# HEI timeline — data scraper

Pulls every `episode` post from [heinetwork.tv](https://www.heinetwork.tv) via the public WordPress REST API and writes `../data/timeline.json`.

## Setup

```bash
cd scraper
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

From the `scraper` directory:

```bash
python scrape.py
```

Options are at the top of `scrape.py` (e.g. `SKIP_COMING_SOON`).

Commit the updated `data/timeline.json` and push to refresh the live site.
