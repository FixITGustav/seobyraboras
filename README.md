# seobyraboras.se

Astro site for Fix IT Webbyrå's Borås SEO pages: Hem, Om oss, Kontakt (plus a 404),
with Decap CMS at `/admin` for editing texts, SEO fields and images.

## Where the content lives

All text, title tags, meta descriptions, headings and images are in `src/content/`:

| File | What it controls |
|---|---|
| `hem.json` | Startsidan: SEO, H1, services, steps, Borås section, FAQ |
| `om-oss.json` | Om oss: SEO, H1, people and portraits, history, values |
| `kontakt.json` | Kontakt: SEO, H1, letter texts, thank-you message |
| `installningar.json` | Phone, email, address, footer text, default share image |

Images uploaded via the CMS go to `src/assets/uploads/` and are optimized by Astro at build time
(WebP, several sizes). The page design and interactions live in `src/pages/` and `src/components/`.

Three ways to edit, all working on the same files:

1. **The CMS** at `https://seobyraboras.se/admin` (log in with GitHub). Every save becomes a commit
   and Cloudflare rebuilds the site, live after about a minute.
2. **Claude Code**: e.g. "change the H1 on the homepage to ...". It edits the JSON file, you push.
3. **By hand** in the JSON files, on GitHub or locally.

## Run locally

```bash
npm install
npm run dev      # site on http://localhost:4321
npm run cms      # in a second terminal: lets /admin edit your local files without logging in
npm run build    # static files in dist/
```

Requires Node 18.20.8 or newer (22 recommended, see `.nvmrc`).

## One-time setup: GitHub, Cloudflare and CMS login

### 1. GitHub
1. Create a free account at github.com.
2. Click **+** (top right) → **New repository**. Name: `seobyraboras`. Private is fine. Leave everything else empty and click **Create repository**.
3. Put this project in it (Claude can push it for you, or use GitHub Desktop).
4. In `public/admin/config.yml`, the repo is set to `FixITGustav/seobyraboras`.

### 2. Cloudflare Pages connected to GitHub
1. Workers & Pages → Create application → **Continue to Pages** → **Connect to Git** → pick `seobyraboras`.
2. Build settings: Framework preset **Astro**, build command `npm run build`, output directory `dist`.
3. Environment variable: `NODE_VERSION` = `22`.
4. Deploy. Then move the custom domain: remove `seobyraboras.se` from the old drag-and-drop project and add it under **Custom domains** in the new one. Delete the old project when the new one works.

### 3. CMS login (GitHub OAuth app)
1. GitHub → your avatar → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
   - Application name: `seobyraboras CMS`
   - Homepage URL: `https://seobyraboras.se`
   - Authorization callback URL: `https://seobyraboras.se/api/callback`
2. Click **Register application**, copy the **Client ID**, then **Generate a new client secret** and copy it.
3. Cloudflare → the Pages project → **Settings** → **Variables and Secrets**, add:
   - `GITHUB_CLIENT_ID` = the Client ID
   - `GITHUB_CLIENT_SECRET` = the secret (choose type **Secret**)
4. Redeploy (Deployments → latest → Retry deployment).
5. Open `https://seobyraboras.se/admin` and log in with GitHub.

Use the admin on `seobyraboras.se`, not on the `.pages.dev` address, since the login is tied to the real domain.
Only people with write access to the GitHub repo can save changes.

The login is handled by two small Cloudflare Pages Functions in `functions/api/` (`auth.js`, `callback.js`).

## Contact form

Without configuration the form opens the visitor's mail app with the letter filled in. To receive
submissions directly, create a form endpoint (e.g. Formspree or Web3Forms) and add it in Cloudflare Pages
as `PUBLIC_FORM_ENDPOINT`, then redeploy.

## Interactive parts

- **Robotläge** (header button or the R key): the page as a crawler reads it, with a live mini audit.
- **Hero search toy** (`src/components/RankClimb.astro`): drag "ditt företag" from page 2 to #1.
- **Folk frågar också** (`src/components/PeopleAlsoAsk.astro`): opening a question reveals another.
- **Riksväg 40 map** (`src/components/Route40.astro`).
- **Sök i vår historia** on Om oss, and the fill-in-the-blanks letter on Kontakt.

## Brand

Navy `#2F354A`, mint `#0FE9AD` / `#0CB183`, coral `#FF808B`, Raleway (self-hosted via Fontsource).
