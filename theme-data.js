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

  // 12 palettes around the color wheel: 2 pink, red, orange, yellow, green, mint, blue, indigo, purple, pink+blue, grayscale.
  var PRESETS = {
    bubblegum: {
      name: "Bubblegum",
      colors: { bg: "#ffffff", surface: "#fff4f9", text: "#3b1f33", accent: "#ff4fa3", accent2: "#ff9ccf", border: "#2e1a2b", shadow: "#ffc2df" }
    },
    sakura: {
      name: "Sakura",
      colors: { bg: "#fffafb", surface: "#fdeef2", text: "#4a2a35", accent: "#e8608a", accent2: "#f7b6c8", border: "#7a3b52", shadow: "#f3c9d6" }
    },
    cherry: {
      name: "Cherry",
      colors: { bg: "#fffcfc", surface: "#ffeeee", text: "#4a1c22", accent: "#e5364f", accent2: "#ff9aa6", border: "#4a1c22", shadow: "#ffcdd3" }
    },
    peach: {
      name: "Peach Soda",
      colors: { bg: "#fffcf8", surface: "#fff1e8", text: "#4a2c1f", accent: "#ff7a59", accent2: "#ffc46b", border: "#4a2c1f", shadow: "#ffd9c4" }
    },
    lemon: {
      name: "Lemon Drop",
      colors: { bg: "#fffef6", surface: "#fff8d6", text: "#3d3410", accent: "#f5b700", accent2: "#ffe066", border: "#3d3410", shadow: "#ffeaa3" }
    },
    gameboy: {
      name: "Handheld",
      colors: { bg: "#f2f7e4", surface: "#e3edc6", text: "#1f3316", accent: "#4f8a2b", accent2: "#9bbc0f", border: "#0f380f", shadow: "#c4d89a" }
    },
    mint: {
      name: "Mint Chip",
      colors: { bg: "#f8fffc", surface: "#e6f8f0", text: "#1c3a32", accent: "#16a383", accent2: "#8ee6c9", border: "#1c3a32", shadow: "#bdeedd" }
    },
    sky: {
      name: "Sky Castle",
      colors: { bg: "#fafdff", surface: "#eaf5ff", text: "#1d2f4a", accent: "#3a8dff", accent2: "#8cc8ff", border: "#1d2f4a", shadow: "#c6e1ff" }
    },
    blueberry: {
      name: "Blueberry",
      colors: { bg: "#fbfbff", surface: "#eef0ff", text: "#25234d", accent: "#5b5bd6", accent2: "#a5a8ff", border: "#25234d", shadow: "#d3d5ff" }
    },
    lavender: {
      name: "Lavender",
      colors: { bg: "#fdfbff", surface: "#f5effe", text: "#33274a", accent: "#b061ff", accent2: "#ff8fd1", border: "#33274a", shadow: "#e2d1fb" }
    },
    cottoncandy: {
      name: "Cotton Candy",
      colors: { bg: "#ffffff", surface: "#f4f7ff", text: "#2b2445", accent: "#ff6fb5", accent2: "#7cc4ff", border: "#2b2445", shadow: "#c9e4ff" }
    },
    mono: {
      name: "Arcade Mono",
      colors: { bg: "#ffffff", surface: "#f3f3f3", text: "#1f1f1f", accent: "#3d3d3d", accent2: "#b8b8b8", border: "#1f1f1f", shadow: "#d9d9d9" }
    }
  };

  var DEFAULTS = {
    enabled: true,
    preset: "bubblegum",
    colors: Object.assign({}, PRESETS.bubblegum.colors),
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
      preset: saved.preset || DEFAULTS.preset,
      colors: Object.assign({}, DEFAULTS.colors, saved.colors),
      bodyFont: saved.bodyFont || DEFAULTS.bodyFont,
      headingFont: saved.headingFont || DEFAULTS.headingFont,
      codeFont: saved.codeFont || DEFAULTS.codeFont,
      effects: Object.assign({}, DEFAULTS.effects, saved.effects)
    };
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
    root.style.setProperty("--px-on-accent", luminance(s.colors.accent) > 0.45 ? s.colors.text : "#ffffff");
    root.style.setProperty("--px-font-body", stack(s.bodyFont, "systemSans"));
    root.style.setProperty("--px-font-heading", stack(s.headingFont, "systemSans"));
    root.style.setProperty("--px-font-code", stack(s.codeFont, "systemMono"));
    root.style.setProperty("--px-cursor", cursor(ARROW, s.colors, 1, 1, "auto"));
    root.style.setProperty("--px-cursor-hand", cursor(HAND, s.colors, 9, 1, "pointer"));

    toggle(root, "px-on", s.enabled);
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
    var px = 2, w = 0, rects = "";
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
    apply: apply,
    STORAGE_KEY: "pixelTheme"
  };
})();
