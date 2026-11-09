# Luscombe Lab website

Website of the Genomics and Regulatory Systems Unit (Luscombe Lab), OIST.

- **Engine:** [Hugo](https://gohugo.io) (custom theme in `layouts/` + `assets/`)
- **Hosting & contact form:** Netlify (Netlify Forms)
- **Editing:** [Sveltia CMS](https://sveltiacms.app) at `/admin/`
- **Publications:** fetched weekly from OpenAlex + PubMed by a GitHub Action; curated in the CMS

See **[docs/SETUP.md](docs/SETUP.md)** for deployment, CMS login and day-to-day editing.

## Quick start

```bash
hugo server                              # preview at http://localhost:1313
python3 scripts/fetch_publications.py    # refresh data/publications_auto.json
```

## Where things live

| Path | Contents |
|---|---|
| `content/` | Page text (Markdown + front matter); one file per person / photo album |
| `data/publications.yaml` | Selected / hidden / manual publications (edited in the CMS) |
| `data/publications_auto.json` | Generated publication list (don't edit) |
| `assets/uploads/` | Images (resized to WebP at build time) |
| `layouts/` | Templates |
| `assets/css/main.css`, `assets/js/main.js` | Styles and small scripts |
| `static/admin/` | Sveltia CMS |
| `scripts/fetch_publications.py` | Publication fetcher (Python standard library only) |
