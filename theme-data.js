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

  var PRESETS = {
    bubblegum: {
      name: "Bubblegum",
      colors: { bg: "#ffffff", surface: "#fff4f9", text: "#3b1f33", accent: "#ff4fa3", accent2: "#ff9ccf", border: "#2e1a2b", shadow: "#ffc2df" }
    },
    sakura: {
      name: "Sakura",
      colors: { bg: "#fffafb", surface: "#fdeef2", text: "#4a2a35", accent: "#e8608a", accent2: "#f7b6c8", border: "#7a3b52", shadow: "#f3c9d6" }
    },
    strawberry: {
      name: "Strawberry Milk",
      colors: { bg: "#fffdfd", surface: "#ffeef0", text: "#5b2a2f", accent: "#ff5c77", accent2: "#ffb3c1", border: "#5b2a2f", shadow: "#ffd1d9" }
    },
    cottoncandy: {
      name: "Cotton Candy",
      colors: { bg: "#ffffff", surface: "#f4f7ff", text: "#2b2445", accent: "#ff6fb5", accent2: "#7cc4ff", border: "#2b2445", shadow: "#c9e4ff" }
    },
    lavender: {
      name: "Lavender",
      colors: { bg: "#fdfbff", surface: "#f5effe", text: "#33274a", accent: "#b061ff", accent2: "#ff8fd1", border: "#33274a", shadow: "#e2d1fb" }
    },
    peach: {
      name: "Peach Soda",
      colors: { bg: "#fffcf8", surface: "#fff1e8", text: "#4a2c1f", accent: "#ff7a59", accent2: "#ffc46b", border: "#4a2c1f", shadow: "#ffd9c4" }
    },
    gameboy: {
      name: "Handheld",
      colors: { bg: "#f2f7e4", surface: "#e3edc6", text: "#1f3316", accent: "#4f8a2b", accent2: "#9bbc0f", border: "#0f380f", shadow: "#c4d89a" }
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
      grid: true,     // faint pixel grid behind the page
      shadows: true,  // chunky hard shadows on boxes and buttons
      scanlines: false,
      squareAvatars: true,
      pixelAvatars: true // re-request avatars at tiny sizes and blow them up = 8-bit portraits
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
    toggle(root, "px-fx-grid", s.effects.grid);
    toggle(root, "px-fx-shadows", s.effects.shadows);
    toggle(root, "px-fx-scanlines", s.effects.scanlines);
    toggle(root, "px-fx-square-avatars", s.effects.squareAvatars);
    toggle(root, "px-fx-pixel-avatars", s.effects.pixelAvatars);
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
