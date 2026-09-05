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

This is a memorial page for Nanchang No. 15 Middle School: **27 photographs of the campus**, a **clickable Leaflet campus map with camera spots**, a **login-free anonymous guestbook**, and a full set of interactions polished for reading — reading progress bar, section-aware navigation, count-up numbers, a growing timeline, and a zoom-and-pan lightbox.

Single file · Zero frameworks · No build step. Clone it, double-click, and it opens.

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

### 🗺 Campus Map (Leaflet)

- The school is pinned to OSM way `260420791` (Qingshanhu campus, 28.7208°N, 115.9322°E)
- **8 camera-spot markers** with popups embedding the matching photo thumbnail and date; all spots live in one `CAMERA_SPOTS` array — easy to edit
- Free OSM tiles + a CSS filter to blend into the site palette; `scrollWheelZoom: false` keeps page scrolling untouched

<p align="center">
  <img src="docs/screenshot-map.png" alt="Campus map: eight camera-spot markers on a Leaflet map" width="86%">
</p>

### 💬 Guestbook (self-hosted Artalk)

- **No login required**: leave a message without filling in nickname or email — the frontend fills in an anonymous identity automatically (same nickname, same identity)
- **Moderated**: new messages enter a pending queue and only appear after the site owner approves them
- Zero third-party dependency: the Artalk server runs on our own machine, the data stays ours

<p align="center">
  <img src="docs/screenshot-wall.png" alt="Guestbook: the Artalk anonymous comment area" width="86%">
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

All animations share a single rAF-driven scroll loop and degrade gracefully when the system asks for reduced motion.

## 🗂 Site structure

```text
site/
├── index.html          # All markup, styles and scripts (single file)
├── images/
│   ├── full/           # 25 full-size photographs
│   ├── thumbs/         # Matching thumbnails
│   └── emblem-*.png    # School emblem (top bar / hero / footer / favicon)
├── leaflet/            # Self-hosted Leaflet 1.9.4 (no CDN dependency)
└── docs/               # Screenshots used by this README
```

## ⚙️ Tech stack

| Layer | Choice |
|------|------|
| Frontend | Pure HTML / CSS / vanilla JS, single file, no build |
| Map | [Leaflet](https://leafletjs.com) 1.9.4 + OpenStreetMap tiles |
| Guestbook | [Artalk](https://artalk.js.org) v2.10 self-hosted + SQLite |
| Serving | nginx reverse proxy `/comment/` → systemd service |
| Deployment | Azure VM · Cloudflare DNS · Let's Encrypt |

## 🚀 Run locally

Nothing to install:

```bash
git clone https://github.com/xxc2007/nanchang-no15-memorial.git
cd xxc
python -m http.server 8000   # or just open index.html
```

> The guestbook needs the self-hosted Artalk service (`/comment/`); locally that area shows a load-failure notice while everything else works.

## 📄 License

[MIT](LICENSE) © 2026 Xiong Xinchen (熊鑫晨) · Campus photographs © Xiong Xinchen

---

<div align="center">
  <sub>Dedicated to the red-brick buildings, the camphor trees and the old water tower by Qingshan Lake.<br><a href="https://xxc2007.me">xxc2007.me</a></sub>
</div>
