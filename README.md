# Pixel Pink for GitHub

A pixelated, video-game light theme for github.com: white and pink, square corners, chunky hard shadows,
arcade fonts, a pink contribution graph, 8-bit avatars and a pixel cursor. Every color can be changed from the popup.

## Install

**Chrome / Edge / Brave / Arc**
1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and pick this folder
4. Pin the pixel heart in the toolbar

**Firefox** (128+)
1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on…** → pick `manifest.json`
   (temporary add-ons are removed when Firefox restarts)

## Customize

Click the heart icon:

- **Pick a palette**: Bubblegum, Sakura, Strawberry Milk, Cotton Candy, Lavender, Peach Soda, Handheld
- **Colors**: 7 colors (background, surface, text, accent, accent 2, border, shadow). Use the picker or type a hex.
  Every other shade (hover, soft tints, graph levels, syntax colors) is mixed from these.
- **Fonts**: Pixelify Sans / Silkscreen / Press Start 2P / VT323, or GitHub's normal fonts
- **Power-ups**: 8-bit avatars, pixel cursor, chunky shadows, grid background, square avatars, CRT scanlines
- **ON/OFF** switch top right turns everything off instantly

Changes show up live on any open GitHub tab.

## Files

| File | What it does |
| --- | --- |
| `github.css` | The theme. Points GitHub's own color tokens at `--px-*` variables, then adds the pixel styling |
| `theme-data.js` | Presets, defaults, and the code that writes your settings onto the page as CSS variables |
| `content.js` | Runs on GitHub: loads fonts, forces light mode, live-updates, pixelates avatars |
| `popup/` | The settings panel |
| `fonts/` | Bundled pixel fonts (GitHub's security policy blocks Google Fonts) |

To tweak the styling by hand, edit `github.css` and hit the reload arrow on the extension card in `chrome://extensions`.

## Fonts

Pixelify Sans, Press Start 2P, Silkscreen and VT323 come from Google Fonts and are licensed under the
[SIL Open Font License 1.1](https://openfontlicense.org).
