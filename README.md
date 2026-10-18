# For Naseehfa — 25th Birthday Website

A responsive, no-photo birthday surprise website with 10 focused interactive surprises, original Tamil friendship poems, short English/Tamil messages, floating stars, confetti, copy-poem buttons, progress tracking, and optional gentle chime sounds.

## Security hardening

- The page now ships with a restrictive Content Security Policy (CSP) to allow only same-origin scripts and controlled external font sources.
- Browser hardening headers are set through meta tags (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) to reduce clickjacking, MIME-sniffing, and unnecessary API exposure.
- Keep all scripts/styles local where possible and avoid adding new third-party resources without updating the CSP.

## Preview locally

1. Extract the ZIP (if using the ZIP).
2. Open `index.html` in a modern browser.
3. Internet access is only needed to load the optional Google Fonts. All interactions are local; there are no trackers or backend services.

For a more reliable local preview, run a static server from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Free deployment

### GitHub Pages
1. Create a public GitHub repository.
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under build/deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Wait for the Pages URL to appear in the same section.

### Netlify Drop
Open `https://app.netlify.com/drop` and drag the extracted website folder into the drop area. Netlify will provide a public link. Free-plan terms and interface labels may change.

## Personalise

Edit `index.html` to change the date, friendship letter, and poems. Edit the `surprises` array near the top of `script.js` to change any surprise title or message. The website currently assumes the birthday date is Monday, 19 October 2026. The surprise trail intentionally contains 10 cards so it stays easy to finish on a phone.
