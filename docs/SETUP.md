# Setup guide

This guide takes the site from this repository to a live website with a working contact form and an online editor (Sveltia CMS). Everything uses free plans.

| Piece | What it does | Where it's configured |
|---|---|---|
| **Hugo** | Turns the Markdown/YAML in this repo into HTML | `hugo.toml`, `layouts/`, `assets/` |
| **Netlify** | Builds and hosts the site, receives contact-form messages, handles the CMS login | `netlify.toml` + Netlify dashboard |
| **Sveltia CMS** | Web editor at `/admin/` that commits changes to GitHub | `static/admin/config.yml` |
| **GitHub Actions** | Refreshes the publication list every week | `.github/workflows/update-publications.yml` |

---

## 1. Push the repository to GitHub

The repository lives at `github.com/johannesnicolaus/luscombelab_website` (already set as `origin`). If you move it (e.g. to an OIST organisation), update `repo:` in `static/admin/config.yml`.

```bash
git push -u origin main
```

## 2. Create the Netlify site

1. Go to <https://app.netlify.com/signup> and choose **Sign up with GitHub**. The free plan is enough.
2. Click **Add new project → Import an existing project → GitHub** and pick `luscombelab_website`.
3. Leave the build settings as they are: they come from `netlify.toml` (`hugo --gc --minify`, publish directory `public`, Hugo version pinned).
4. Click **Deploy**. After a minute or two the site is live at `https://<random-name>.netlify.app`.
5. Optional: **Project configuration → General → Change project name** to e.g. `luscombelab`, which gives you `luscombelab.netlify.app`.

Every push to `main` (including edits made in the CMS) now rebuilds the site automatically.

> If the final address is not `https://luscombelab.netlify.app`, update `baseURL` in `hugo.toml` and `site_url` / `display_url` in `static/admin/config.yml`.

## 3. Turn on the contact form

The form on `/contact/` is a native Netlify Form: no third-party service and no extra JavaScript.

1. In Netlify open **Project configuration → Forms** (or the **Forms** tab) and click **Enable form detection**.
2. Trigger a new deploy (**Deploys → Trigger deploy → Deploy site**). Netlify detects the `contact` form while it deploys.
3. Under **Forms → Form notifications → Add notification → Email notification**, choose form `contact` and enter the address that should receive messages (e.g. the lab admin). Add several notifications if more than one person should get them.
4. Test it: send a message from the live site. It appears under **Forms → contact** and arrives by e-mail.

Spam protection: a hidden honeypot field plus Netlify's built-in spam filter (flagged messages go to the "Spam" list in the dashboard).
Free plan limit: 100 submissions per month, which is plenty for a lab site.

## 4. Enable the CMS login (GitHub OAuth through Netlify)

Editors log in at `https://<your-site>/admin/` with their GitHub account. Netlify handles the OAuth handshake, so you don't need to run an auth server.

1. On GitHub go to **Settings → Developer settings → OAuth Apps → New OAuth App** (personal account), or under the organisation's settings if the repo belongs to an org.
   - Application name: `Luscombe Lab CMS`
   - Homepage URL: your site URL, e.g. `https://luscombelab.netlify.app`
   - Authorization callback URL: **`https://api.netlify.com/auth/done`**
2. Click **Register application**, then **Generate a new client secret**. Copy the **Client ID** and **Client secret**.
3. In Netlify: **Project configuration → Access & security → OAuth → Authentication providers → Install provider → GitHub**, and paste the Client ID and secret.
4. Open `https://<your-site>/admin/` → **Sign In with GitHub**.

**Adding editors:** anyone who should edit the site needs a GitHub account with **write** access to the repository (GitHub repo → **Settings → Collaborators → Add people**).

*Alternative without OAuth:* on the login screen, **Sign In Using Access Token** works with a GitHub fine-grained personal access token (repository *Contents: Read and write*). This is fine for one or two technical editors.

## 5. Custom domain (optional)

Netlify → **Domain management → Add a domain**. For a subdomain such as `luscombelab.oist.jp`, ask OIST IT to add a **CNAME** record pointing to `<your-site>.netlify.app`. HTTPS is issued automatically once DNS works. Afterwards, update `baseURL` (hugo.toml) and `site_url` (admin/config.yml).

## 6. Publications

- `scripts/fetch_publications.py` downloads every work linked to Nick's ORCID from **OpenAlex** and cross-checks **PubMed** (`Luscombe NM[Author]`). It removes datasets, errata and peer-review reports, merges duplicates (preprints are folded into the published version) and writes `data/publications_auto.json`. Never edit that file by hand: it is overwritten.
- The GitHub Action runs it **every Monday**. If anything changed it commits the new list, and Netlify rebuilds. You can run it any time: GitHub → **Actions → Update publications → Run workflow**.
- In the CMS, **Publications → Selected, hidden & manual publications** lets you:
  - **Selected**: DOIs (or PMIDs) shown at the top of the page.
  - **Hidden**: remove wrong matches (e.g. a paper by a different "N Luscombe"). Paste the DOI.
  - **Manual entries**: add anything missing. A manual entry with the same DOI as an automatic one *replaces* it, which is how you fix a wrong title or author list.
- Lab members are bolded automatically (surname + first initial, from the People entries and the alumni list). If someone publishes under a different spelling (accents, a maiden name), add it under **Name variants in publications** in their People entry.

**API keys (recommended, free).** Without a key, OpenAlex shares a small daily budget among everyone on the same IP address. GitHub's shared runners may hit that limit, and the weekly run then fails (the site keeps the previous list). To avoid this:
1. Get a free key at <https://openalex.org/settings/api>.
2. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, name `OPENALEX_API_KEY`.
3. Optional: an NCBI key (<https://www.ncbi.nlm.nih.gov/account/settings/>) saved as the `NCBI_API_KEY` secret.

## 7. Working on the site locally

Install Hugo (standard or extended, ≥ 0.169) and run from the repo root:

```bash
hugo server
```

Open <http://localhost:1313>. To try the CMS without logging in, open <http://localhost:1313/admin/> in **Chrome or Edge**, click **Work with Local Repository** and select this folder. Edits are written straight to your files; commit and push them yourself.

Refresh the publication list locally:

```bash
python3 scripts/fetch_publications.py
```

## 8. Everyday editing (for lab members)

| Task | In the CMS |
|---|---|
| New lab member | **People → New Person**: name, role, group (Professor / Scientists / Technicians / Students / Interns / …), photo, bio. "Order" sets the position within the group. |
| Journal cover | **Publications → Publications page text → Journal covers**: upload the image, journal, year and DOI. |
| Someone leaves | Open their entry → tick **Former member** (optionally add "now at …"). |
| New photo album | **Lab Photos → New Album**: drag in photos. Give it a small "Order" number to show it first. |
| Add a plankton video | **Pages → Plankton Gallery → Gallery items**: YouTube ID, or upload an MP4 plus a thumbnail. |
| Advertise a position | **Pages → Open Positions → Current openings**. Untick "Open" when it closes. |
| Feature or hide a paper | **Publications → Selected, hidden & manual publications** |

Uploaded photos can be straight from a phone: the site resizes them and converts them to WebP automatically.

## 9. Japanese version (日本語)

The site is bilingual: English at `/`, Japanese at `/ja/`. A language switch sits at the end of the menu.

- **Page text** lives next to the English file with a `.ja` suffix, e.g. `content/contact/_index.md` → `content/contact/_index.ja.md`, `content/people/kanchi-nanjo.md` → `kanchi-nanjo.ja.md`.
- **Pages without a `.ja.md` file still exist under `/ja/`.** They show the English text with a short note saying the page is not translated yet, and tell search engines that the English page is the original. So you can translate one page at a time.
- **Fixed interface text** (menu names, button labels, headings such as "Former members", form labels) is in `i18n/en.yaml` and `i18n/ja.yaml`. Menu names are in `hugo.toml` under `[languages.ja.menus]`; the Japanese unit name, address and site title are under `[languages.ja]`.
- **In the CMS**, each entry shows English and Japanese side by side. Fields such as photos, links, order and "Former member" are copied from English automatically, so only text needs translating. To keep an entry English-only, switch Japanese off for that entry; the English version is then shown under `/ja/`.
- A `.ja.md` file is a complete page: when it exists, the English file is not used for `/ja/` at all. If you edit an English file outside the CMS (e.g. change a photo), make the same change in its `.ja.md` file.
- Publication lists, DOIs and author names are not translated. Member names in Japanese (katakana) are fine: bold names in the publication list still use the English name.
