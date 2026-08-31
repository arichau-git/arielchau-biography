# Ariel Chau — Personal Website

A single-page personal site to share with recruiters and interviewers. Plain HTML/CSS/JS —
no build step, no dependencies.

## Files
- `index.html` — all page content
- `styles.css` — styling (light/dark mode aware)
- `script.js` — mobile nav + scroll animations
- `assets/Ariel_Chau_Resume.pdf` — downloadable résumé (swap this file to update the download link)

## Preview locally
Just double-click `index.html`, or from this folder run:
```
python -m http.server 8000
```
then open http://localhost:8000

## Deploy (free options)

### Option A: GitHub Pages
1. Create a new GitHub repo (e.g. `ariel-site`) and push this folder to it.
2. In the repo: Settings → Pages → Source → select the `main` branch, `/ (root)` folder.
3. Your site will be live at `https://<your-username>.github.io/ariel-site/` in a minute or two.
4. (Optional) Add a custom domain under Settings → Pages → Custom domain.

### Option B: Netlify (drag-and-drop, no git required)
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. Netlify gives you a live URL immediately (e.g. `random-name.netlify.app`), which you can rename
   in Site settings → Change site name.

### Option C: Vercel
1. Go to https://vercel.com/new, import this folder (or a GitHub repo containing it).
2. Deploy with default settings — it's a static site, no build command needed.

## Updating content later
- Text: edit the relevant section directly in `index.html`.
- Résumé: replace `assets/Ariel_Chau_Resume.pdf` with a new file of the same name.
- Photo: if you want to add a headshot, drop an image into `assets/` and add an `<img>` tag
  in the `.about-grid` or `.hero-inner` section of `index.html`.
- Colors: tweak the CSS variables at the top of `styles.css` (`--accent`, `--bg`, etc.)
