# HEI Network Timeline — project notes

This repo implements a static timeline of HEI Network episodes, sourced from the public WordPress REST API (`/wp-json/wp/v2/episode`).

- **Refresh data**: `cd scraper && pip install -r requirements.txt && python scrape.py`
- **API**: `GET /api/timeline` returns `data/timeline.json`
- **Deploy**: Connect the repo to Vercel; add your custom domain in the Vercel dashboard.

See [README.md](README.md) for full documentation.
