# Personal Dashboard

A minimal static personal dashboard (HTML/CSS/JS) that runs entirely in the browser. Features:

- Live clock
- Quick links
- Notes saved in localStorage (save/clear)
- Simple search (Google or direct URL)
- Light/Dark theme saved to localStorage

## Run locally

Open `index.html` in your browser, or run a local static server. With Python installed you can run:

```powershell
# From the personal-dashboard folder
python -m http.server 8000
# then open http://localhost:8000
```

## Host for free

Two quick options:

- GitHub Pages
  - Create a new repository and push the `personal-dashboard/` folder (or the full repo).
  - In the repo settings -> Pages, set the source to the `main` or `master` branch and root folder.
  - The site will be available at `https://<your-username>.github.io/<repo>/`.

- Netlify (drag & drop)
  - Zip the `personal-dashboard/` folder and drag it into Netlify's "Sites" -> "Drag & drop" area.
  - Or connect your GitHub repo and set `personal-dashboard/` as the publish directory.

## Next steps / ideas

- Add weather widget (requires a free API key)
- Add RSS/news feed
- Make links editable
- Add keyboard shortcuts

Enjoy — changes are intentionally small and self-contained so it's easy to expand.
