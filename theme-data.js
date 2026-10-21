// Shared between the content script and the popup.
// Every color here becomes a CSS variable: bg -> --px-bg, accent -> --px-accent, etc.

var PIXEL_THEME = (function () {
  var COLOR_KEYS = [
    { key: "bg",      label: "Background",  hint: "the page itself" },
    { key: "surface", label: "Surface",     hint: "boxes, cards, header" },
    { key: "text",    label: "Text",        hint: "main text" },
    { key: "accent",  label: "Accent",      hint: "buttons, links, graph" },
    { key: "accent2", label: "Accent 2",    hint: "highlights, strings" },
    { key: "border",  label: "Border",      hint: "pixel outlines" },
    { key: "shadow",  label: "Shadow",      hint: "hard drop shadows" }
  ];

  // 12 palettes around the color wheel (2 pink, red, orange, yellow, green, mint, blue, indigo, purple,
  // pink+blue, grayscale), each with a light and a dark version.
  var PRESETS = {
    bubblegum: {
      name: "Bubblegum",
      light: { bg: "#ffffff", surface: "#fff4f9", text: "#3b1f33", accent: "#ff4fa3", accent2: "#ff9ccf", border: "#2e1a2b", shadow: "#ffc2df" },
      dark:  { bg: "#1e1220", surface: "#2a1a2c", text: "#ffe6f3", accent: "#ff5fb0", accent2: "#ff9ccf", border: "#c66f9f", shadow: "#4d1d40" }
    },
    sakura: {
      name: "Sakura",
      light: { bg: "#fffafb", surface: "#fdeef2", text: "#4a2a35", accent: "#e8608a", accent2: "#f7b6c8", border: "#7a3b52", shadow: "#f3c9d6" },
      dark:  { bg: "#1f1517", surface: "#2b1d21", text: "#fbe4ea", accent: "#f07aa0", accent2: "#f7b6c8", border: "#b0687f", shadow: "#4a2431" }
    },
    cherry: {
      name: "Cherry",
      light: { bg: "#fffcfc", surface: "#ffeeee", text: "#4a1c22", accent: "#e5364f", accent2: "#ff9aa6", border: "#4a1c22", shadow: "#ffcdd3" },
      dark:  { bg: "#1c1012", surface: "#28171a", text: "#ffe3e6", accent: "#ff4d66", accent2: "#ff9aa6", border: "#c25563", shadow: "#4d1820" }
    },
    peach: {
      name: "Peach Soda",
      light: { bg: "#fffcf8", surface: "#fff1e8", text: "#4a2c1f", accent: "#ff7a59", accent2: "#ffc46b", border: "#4a2c1f", shadow: "#ffd9c4" },
      dark:  { bg: "#1e1510", surface: "#2a1e17", text: "#ffeadd", accent: "#ff8a66", accent2: "#ffc46b", border: "#c27a5c", shadow: "#4d2a1a" }
    },
    lemon: {
      name: "Lemon Drop",
      light: { bg: "#fffef6", surface: "#fff8d6", text: "#3d3410", accent: "#f5b700", accent2: "#ffe066", border: "#3d3410", shadow: "#ffeaa3" },
      dark:  { bg: "#1c1a0e", surface: "#282514", text: "#fff6cc", accent: "#ffcc33", accent2: "#ffe066", border: "#b39a3c", shadow: "#4a3f10" }
    },
    gameboy: {
      name: "Handheld",
      light: { bg: "#f2f7e4", surface: "#e3edc6", text: "#1f3316", accent: "#4f8a2b", accent2: "#9bbc0f", border: "#0f380f", shadow: "#c4d89a" },
      dark:  { bg: "#0f1f0f", surface: "#173017", text: "#d6f0a8", accent: "#8bac0f", accent2: "#9bbc0f", border: "#4f8a2b", shadow: "#062006" }
    },
    mint: {
      name: "Mint Chip",
      light: { bg: "#f8fffc", surface: "#e6f8f0", text: "#1c3a32", accent: "#16a383", accent2: "#8ee6c9", border: "#1c3a32", shadow: "#bdeedd" },
      dark:  { bg: "#0f1c18", surface: "#152823", text: "#dcfaef", accent: "#2fd1a8", accent2: "#8ee6c9", border: "#3d8f78", shadow: "#08332a" }
    },
    sky: {
      name: "Sky Castle",
      light: { bg: "#fafdff", surface: "#eaf5ff", text: "#1d2f4a", accent: "#3a8dff", accent2: "#8cc8ff", border: "#1d2f4a", shadow: "#c6e1ff" },
      dark:  { bg: "#0f1726", surface: "#162236", text: "#e3f0ff", accent: "#4d9aff", accent2: "#8cc8ff", border: "#4a76b0", shadow: "#0b2550" }
    },
    blueberry: {
      name: "Blueberry",
      light: { bg: "#fbfbff", surface: "#eef0ff", text: "#25234d", accent: "#5b5bd6", accent2: "#a5a8ff", border: "#25234d", shadow: "#d3d5ff" },
      dark:  { bg: "#141329", surface: "#1d1c3a", text: "#e6e6ff", accent: "#7d7dff", accent2: "#a5a8ff", border: "#5f5fb8", shadow: "#23215a" }
    },
    lavender: {
      name: "Lavender",
      light: { bg: "#fdfbff", surface: "#f5effe", text: "#33274a", accent: "#b061ff", accent2: "#ff8fd1", border: "#33274a", shadow: "#e2d1fb" },
      dark:  { bg: "#19122a", surface: "#24193a", text: "#f1e6ff", accent: "#b97aff", accent2: "#ff8fd1", border: "#8a5fc0", shadow: "#3a2163" }
    },
    cottoncandy: {
      name: "Cotton Candy",
      light: { bg: "#ffffff", surface: "#f4f7ff", text: "#2b2445", accent: "#ff6fb5", accent2: "#7cc4ff", border: "#2b2445", shadow: "#c9e4ff" },
      dark:  { bg: "#161827", surface: "#1f2236", text: "#f3ecff", accent: "#ff6fb5", accent2: "#7cc4ff", border: "#7a77b8", shadow: "#2c3a66" }
    },
    mono: {
      name: "Arcade Mono",
      light: { bg: "#ffffff", surface: "#f3f3f3", text: "#1f1f1f", accent: "#3d3d3d", accent2: "#b8b8b8", border: "#1f1f1f", shadow: "#d9d9d9" },
      dark:  { bg: "#121212", surface: "#1c1c1c", text: "#ececec", accent: "#d0d0d0", accent2: "#6f6f6f", border: "#8a8a8a", shadow: "#000000" }
    }
  };

  var DEFAULTS = {
    enabled: true,
    mode: "light",            // light | dark
    preset: "bubblegum",
    colors: Object.assign({}, PRESETS.bubblegum.light),
    bodyFont: "pixelify",     // pixelify | silkscreen | system
    headingFont: "pressstart", // pressstart | silkscreen | pixelify
    codeFont: "vt323",         // vt323 | system
    effects: {
      cursor: true,   // pixel arrow cursor
      shadows: true,  // chunky hard shadows on boxes and buttons
      grid: false,    // faint pixel grid behind the page
      scanlines: false,
      squareAvatars: true
    }
  };

  // Merge whatever is saved over the defaults so new options never come back undefined.
  function withDefaults(saved) {
    saved = saved || {};
    return {
      enabled: saved.enabled !== undefined ? saved.enabled : DEFAULTS.enabled,
      mode: saved.mode === "dark" ? "dark" : "light",
      preset: saved.preset || DEFAULTS.preset,
      colors: Object.assign({}, DEFAULTS.colors, saved.colors),
      bodyFont: saved.bodyFont || DEFAULTS.bodyFont,
      headingFont: saved.headingFont || DEFAULTS.headingFont,
      codeFont: saved.codeFont || DEFAULTS.codeFont,
      effects: Object.assign({}, DEFAULTS.effects, saved.effects)
    };
  }

  // Colors for a palette in a given mode. Hand-picked for presets; for custom colors,
  // flip the lightness of the neutrals (background, surface, text, border, shadow) and keep the accents.
  function paletteFor(presetId, colors, mode) {
    var p = PRESETS[presetId];
    if (p) return Object.assign({}, p[mode]);
    var out = Object.assign({}, colors);
    if (isDark(colors) === (mode === "dark")) return out;
    ["bg", "surface", "text", "border", "shadow"].forEach(function (k) { out[k] = flipLightness(colors[k]); });
    return out;
  }

  function isDark(colors) {
    return luminance(colors.bg) < luminance(colors.text);
  }

  function flipLightness(hex) {
    var hsl = toHsl(hex);
    var l = 0.06 + (1 - hsl[2]) * 0.88;
    // Pastel tints turn neon when darkened, so mute the saturation on the dark side.
    return fromHsl(hsl[0], l < 0.5 ? hsl[1] * 0.4 : hsl[1], l);
  }

  function toHsl(hex) {
    var n = parseInt(String(hex).slice(1), 16);
    var r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, h = 0, s = 0, d = max - min;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }

  function fromHsl(h, s, l) {
    function f(n) {
      var k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l);
      var v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return ("0" + Math.round(v * 255).toString(16)).slice(-2);
    }
    return "#" + f(0) + f(8) + f(4);
  }

  var FONT_STACKS = {
    pixelify:   "'PX Pixelify Sans', 'PX VT323', monospace",
    silkscreen: "'PX Silkscreen', 'PX Pixelify Sans', monospace",
    pressstart: "'PX Press Start 2P', 'PX Silkscreen', monospace",
    vt323:      "'PX VT323', ui-monospace, monospace",
    systemSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
    systemMono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
  };

  function stack(choice, fallback) {
    return FONT_STACKS[choice === "system" ? fallback : choice] || FONT_STACKS[fallback];
  }

  // Applies the settings to a root element as CSS variables + classes.
  // Used both on github.com and inside the popup (so the popup is a live preview).
  function apply(root, settings) {
    var s = withDefaults(settings);
    Object.keys(s.colors).forEach(function (k) {
      root.style.setProperty("--px-" + k, s.colors[k]);
    });
    // Text on accent-colored buttons: the darkest palette color on light accents (yellow), white on the rest.
    var darkest = luminance(s.colors.text) < luminance(s.colors.bg) ? s.colors.text : s.colors.bg;
    root.style.setProperty("--px-on-accent", luminance(s.colors.accent) > 0.45 ? darkest : "#ffffff");
    root.style.setProperty("--px-font-body", stack(s.bodyFont, "systemSans"));
    root.style.setProperty("--px-font-heading", stack(s.headingFont, "systemSans"));
    root.style.setProperty("--px-font-code", stack(s.codeFont, "systemMono"));
    root.style.setProperty("--px-cursor", cursor(ARROW, s.colors, 0, 0, "auto"));
    root.style.setProperty("--px-cursor-hand", cursor(HAND, s.colors, 5, 0, "pointer"));

    toggle(root, "px-on", s.enabled);
    toggle(root, "px-dark", s.mode === "dark");
    toggle(root, "px-body-font", s.bodyFont !== "system");
    toggle(root, "px-code-font", s.codeFont !== "system");
    toggle(root, "px-code-vt", s.codeFont === "vt323");
    toggle(root, "px-fx-cursor", s.effects.cursor);
    toggle(root, "px-fx-shadows", s.effects.shadows);
    toggle(root, "px-fx-grid", s.effects.grid);
    toggle(root, "px-fx-scanlines", s.effects.scanlines);
    toggle(root, "px-fx-square-avatars", s.effects.squareAvatars);
    return s;
  }

  // Pixel-art cursors. 1 = outline (border color), 2 = fill (accent color).
  var ARROW = [
    "1",
    "11",
    "121",
    "1221",
    "12221",
    "122221",
    "1222221",
    "12222221",
    "122222221",
    "1222222221",
    "12222211111",
    "1221221",
    "121 1221",
    "11  1221",
    "1    1221",
    "     1221",
    "      11"
  ];
  var HAND = [
    "    11",
    "   1221",
    "   1221",
    "   1221",
    "   1221111",
    "   1221221111",
    "   12212212211",
    " 1112212212221",
    "12212222222221",
    "12222222222221",
    " 1222222222221",
    "  122222222221",
    "  12222222221",
    "   1222222221",
    "   1222222221",
    "   1111111111"
  ];

  function cursor(bitmap, colors, hotX, hotY, fallback) {
    var px = 1, w = 0, rects = "";
    bitmap.forEach(function (row, y) {
      w = Math.max(w, row.length);
      for (var x = 0; x < row.length; x++) {
        var c = row[x] === "1" ? colors.border : row[x] === "2" ? colors.accent : null;
        if (c) rects += "<rect x='" + x * px + "' y='" + y * px + "' width='" + px + "' height='" + px + "' fill='" + c + "'/>";
      }
    });
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w * px + "' height='" + bitmap.length * px +
      "' shape-rendering='crispEdges'>" + rects + "</svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") ' + hotX + " " + hotY + ", " + fallback;
  }

  // Relative luminance (0 = black, 1 = white) of a #rrggbb color.
  function luminance(hex) {
    var n = parseInt(String(hex).slice(1), 16);
    var ch = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  function toggle(root, cls, on) {
    root.classList.toggle(cls, !!on);
  }

  return {
    COLOR_KEYS: COLOR_KEYS,
    PRESETS: PRESETS,
    DEFAULTS: DEFAULTS,
    withDefaults: withDefaults,
    paletteFor: paletteFor,
    apply: apply,
    STORAGE_KEY: "pixelTheme"
  };
})();
