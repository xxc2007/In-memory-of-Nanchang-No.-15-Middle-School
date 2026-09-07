<sub>🌐 <a href="README.md">中文</a> · <b>English</b></sub>

<div align="center">

# Memorial by Qingshan Lake

> *"The alma mater is the campus you only start to miss after you've left it."*

[![Live Site](https://img.shields.io/badge/🌐_Live-xxc2007.me-D97757)](https://xxc2007.me)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Dependencies-Vanilla_JS-orange)](#️-tech-stack)
[![Self-hosted](https://img.shields.io/badge/Guestbook-Artalk_Self--hosted-blueviolet)](#-guestbook)

<br>

**A private memorial of one school — putting three years of time at an address you can always return to.**

<br>

This is a memorial page for Nanchang No. 15 Middle School: **25 photographs of the campus**, a **photo tour with a clickable Chinese-labeled location map (MapLibre GL)**, a **login-free anonymous guestbook**, and a full set of interactions polished for reading — reading progress bar, section-aware navigation, count-up numbers, a growing timeline, and a zoom-and-pan lightbox.

Pure HTML / CSS / vanilla JS with structure, style and behavior separated (`index.html` + `assets/`) — zero frameworks, no build step.

[Live Site](https://xxc2007.me) · [Structure](#-site-structure) · [Highlights](#-highlights) · [Tech Stack](#️-tech-stack) · [Run Locally](#-run-locally)

</div>

---

<p align="center">
  <img src="docs/screenshot-hero.png" alt="Hero section: emblem, serif headline and counting key numbers" width="100%">
</p>

---

## ✨ Highlights

### 📖 The memorial itself

- **Seven sections**: School Overview → History → Campus Gallery (25 photographs in six themed groups) → The Water Tower → Campus Map → Epilogue → Guestbook
- Claude visual language: cream paper background + terracotta accents + serif headlines, with consistent hairlines and rounded cards throughout
- Fully responsive (three breakpoints) with a `prefers-reduced-motion` fallback

### 🗺 Campus Tour (photo tour + MapLibre location map)

- The school is pinned to OSM way `260420791` (Qingshanhu campus, 28.7208°N, 115.9322°E)
- **Full-frame photo tour**: 8 spots, 8 photographs, switchable via arrows/dots/keyboard, with a slow Ken Burns push
- **Chinese-labeled location map**: OSM raster basemap, 8 markers linked with the tour — click a marker and the camera flies there
- MapLibre loads on demand as you scroll near the map section; all spots live in one `SPOTS` array in `assets/map.js` — easy to edit

<p align="center">
  <img src="docs/screenshot-map.png" alt="Campus map: eight camera-spot markers in 3D satellite view" width="86%">
</p>

### 💬 Guestbook (self-hosted Artalk)

- **No login required**: leave a message without filling in nickname or email — the frontend fills in an anonymous identity automatically (same nickname, same identity)
- **Moderated**: new messages enter a pending queue and only appear after the site owner approves them
- Zero third-party dependency: the Artalk server runs on our own machine, the data stays ours

<p align="center">
  <img src="docs/screenshot-guestbook.png" alt="Guestbook: bilibili-style anonymous comments (avatar / IP region / Beijing time)" width="86%">
</p>

### 🎬 Interactions (vanilla JS, zero dependencies)

| Interaction | Details |
|------|------|
| Reading progress | A terracotta hairline under the top bar, `scaleX` follows scroll |
| Nav highlight | Scrollspy lights up the current section |
| Count-up numbers | Hero key numbers 0 → 1958 / 51 / 2600+ / 25 with easeOutQuart |
| Hero parallax | The hero image drifts at half scroll speed, `scale(1.09)` hides the edges |
| Growing timeline | The history line draws itself downward; year nodes light up as it passes |
| Lightbox | Cursor-centered wheel zoom 1–4×, double-click zoom, drag pan, pinch, clamped edges — coexists safely with swipe navigation |
| Light dust | A full-page canvas of breathing dust motes with gentle cursor repulsion; the guestbook adds its own "dark river" flow-field particles |
| Gallery fade & tilt | Images fade in as they load; desktop cards tilt subtly with the cursor |

All animations share a single rAF-driven scroll loop and degrade gracefully when the system asks for reduced motion.

## 🗂 Site structure

```text
site/
├── index.html          # Semantic markup (no inline styles or scripts)
├── assets/
│   ├── style.css       # Site-wide styles (tokens, components, breakpoints, fallbacks)
│   ├── main.js         # Main interactions: progress, scrollspy, parallax, inertia, particles, lightbox
│   ├── map.js          # Photo tour + location map (lazy-loaded MapLibre)
│   └── wall.js         # Guestbook (talks to self-hosted Artalk)
├── images/
│   ├── full/           # 25 full-size photographs
│   ├── thumbs/         # Matching thumbnails
│   └── emblem-*.png    # School emblem (top bar / hero / footer / favicon)
├── maplibre/           # Self-hosted MapLibre GL v5 (no CDN dependency)
└── docs/               # Screenshots used by this README
```

## ⚙️ Tech stack

| Layer | Choice |
|------|------|
| Frontend | Pure HTML / CSS / vanilla JS, structure·style·behavior separated, no build |
| Map | [MapLibre GL](https://maplibre.org) v5 + OSM raster basemap (Chinese labels), lazy-loaded |
| Guestbook | [Artalk](https://artalk.js.org) v2.10 self-hosted + SQLite |
| Serving | nginx reverse proxy `/comment/` → systemd service |
| Deployment | Azure VM · Cloudflare DNS · Let's Encrypt |

## 🚀 Run locally

Nothing to install:

```bash
git clone https://github.com/xxc2007/In-memory-of-Nanchang-No.-15-Middle-School.git
cd In-memory-of-Nanchang-No.-15-Middle-School
python -m http.server 8000   # or any static server; open http://localhost:8000
```

> The guestbook needs the self-hosted Artalk service (`/comment/`); locally that area shows a load-failure notice while everything else works. Opening `index.html` directly via `file://` also works for browsing; only the map tiles and the guestbook need network.

## 📄 License

[MIT](LICENSE) © 2026 Xiong Xinchen (熊鑫晨) · Campus photographs © Xiong Xinchen

---

<div align="center">
  <sub>Dedicated to the red-brick buildings, the camphor trees and the old water tower by Qingshan Lake.<br><a href="https://xxc2007.me">xxc2007.me</a></sub>
</div>
