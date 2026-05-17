# anudeep.live — Personal Portfolio

[![Site](https://img.shields.io/badge/site-anudeep.live-0891b2?style=flat-square)](https://anudeep.live)
[![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-1c1917?style=flat-square&logo=github)](https://pages.github.com/)

Source for my personal portfolio site, deployed via **GitHub Pages** at
[anudeep.live](https://anudeep.live).

Built with plain **HTML + CSS + vanilla JS** — no build step, no framework
overhead. GitHub Pages serves the files directly from `main`.

## Tech

- Hand-rolled HTML, CSS custom-properties, vanilla JS (zero dependencies)
- `IntersectionObserver` for scroll reveal
- GitHub REST API (live-fetched projects, cached in `localStorage` for 1h)
- Inter + JetBrains Mono via Google Fonts
- Responsive, accessible, `prefers-reduced-motion` aware

## Project structure

```
.
├── index.html        # Main page
├── 404.html          # Custom 404
├── assets/
│   ├── style.css     # All styles
│   └── script.js     # Nav, typing effect, reveal, GitHub fetch
├── CNAME             # Custom domain (anudeep.live)
├── .nojekyll         # Disable Jekyll processing
├── robots.txt
└── sitemap.xml
```

## Local development

Any static server works. Two quick options:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then visit `http://localhost:8080`.

## Contact

- Email — [anudeepsvka@gmail.com](mailto:anudeepsvka@gmail.com)
- LinkedIn — [linkedin.com/in/anudeep-s](https://www.linkedin.com/in/anudeep-s/)
- GitHub — [@anudeep652](https://github.com/anudeep652)
