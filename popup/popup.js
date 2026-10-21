(function () {
  var T = PIXEL_THEME;
  var settings = T.withDefaults();
  var $ = function (id) { return document.getElementById(id); };
  var savedTimer;

  chrome.storage.local.get(T.STORAGE_KEY, function (data) {
    settings = T.withDefaults(data[T.STORAGE_KEY]);
    build();
    render();
  });

  function build() {
    // Preset buttons
    Object.keys(T.PRESETS).forEach(function (id) {
      var p = T.PRESETS[id];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset";
      btn.dataset.preset = id;
      btn.title = p.name;
      var strip = document.createElement("span");
      strip.className = "strip";
      ["bg", "accent2", "accent", "border"].forEach(function (k) {
        var s = document.createElement("span");
        s.dataset.key = k;
        strip.appendChild(s);
      });
      btn.appendChild(strip);
      btn.appendChild(document.createTextNode(p.name));
      btn.addEventListener("click", function () {
        settings.preset = id;
        settings.colors = T.paletteFor(id, null, settings.mode);
        save();
      });
      $("presets").appendChild(btn);
    });

    // One row per color: picker + name + hex field
    T.COLOR_KEYS.forEach(function (c) {
      var row = document.createElement("div");
      row.className = "color-row";
      var picker = el("input", { type: "color", "aria-label": c.label });
      var name = el("span", { class: "color-name" });
      name.appendChild(el("b", {}, c.label));
      name.appendChild(el("small", {}, c.hint));
      var hex = el("input", { type: "text", spellcheck: "false", maxlength: "7", pattern: "#[0-9a-fA-F]{6}", "aria-label": c.label + " hex" });
      row.append(picker, name, hex);
      picker.dataset.color = c.key;
      hex.dataset.hex = c.key;
      picker.addEventListener("input", function () { setColor(c.key, picker.value); });
      hex.addEventListener("input", function () {
        var v = hex.value.trim();
        if (v[0] !== "#") v = "#" + v;
        if (/^#[0-9a-f]{6}$/i.test(v)) setColor(c.key, v.toLowerCase(), hex);
      });
      $("colors").appendChild(row);
    });

    ["bodyFont", "headingFont", "codeFont"].forEach(function (key) {
      $(key).addEventListener("change", function () { settings[key] = this.value; save(); });
    });

    document.querySelectorAll("[data-effect]").forEach(function (box) {
      box.addEventListener("change", function () { settings.effects[box.dataset.effect] = box.checked; save(); });
    });

    document.querySelectorAll("[data-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (settings.mode === b.dataset.mode) return;
        settings.mode = b.dataset.mode;
        settings.colors = T.paletteFor(settings.preset, settings.colors, settings.mode);
        save();
      });
    });

    $("enabled").addEventListener("change", function () { settings.enabled = this.checked; save(); });

    $("reset").addEventListener("click", function () {
      settings = T.withDefaults();
      save();
    });
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text) node.textContent = text;
    return node;
  }

  function setColor(key, value, skipField) {
    settings.colors[key] = value;
    settings.preset = matchingPreset(settings.colors);
    save(skipField);
  }

  // If hand-picked colors happen to equal a preset, light that preset up again.
  function matchingPreset(colors) {
    return Object.keys(T.PRESETS).find(function (id) {
      var p = T.PRESETS[id][settings.mode];
      return Object.keys(p).every(function (k) { return p[k].toLowerCase() === String(colors[k]).toLowerCase(); });
    }) || "custom";
  }

  function render(skipField) {
    T.apply(document.documentElement, settings);
    document.querySelectorAll("[data-mode]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.mode === settings.mode));
    });

    document.querySelectorAll(".preset").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.preset === settings.preset));
      var colors = T.PRESETS[b.dataset.preset][settings.mode];
      b.querySelectorAll(".strip span").forEach(function (sw) { sw.style.background = colors[sw.dataset.key]; });
    });
    T.COLOR_KEYS.forEach(function (c) {
      var v = settings.colors[c.key];
      var picker = document.querySelector('[data-color="' + c.key + '"]');
      var hex = document.querySelector('[data-hex="' + c.key + '"]');
      if (picker.value !== v) picker.value = v;
      if (hex !== skipField) hex.value = v;
    });
    $("bodyFont").value = settings.bodyFont;
    $("headingFont").value = settings.headingFont;
    $("codeFont").value = settings.codeFont;
    document.querySelectorAll("[data-effect]").forEach(function (box) {
      box.checked = !!settings.effects[box.dataset.effect];
    });
    $("enabled").checked = settings.enabled;
    $("enabled-label").textContent = settings.enabled ? "ON" : "OFF";
    $("controls").classList.toggle("off", !settings.enabled);
  }

  function save(skipField) {
    render(skipField);
    var data = {};
    data[T.STORAGE_KEY] = settings;
    chrome.storage.local.set(data, function () {
      $("saved").textContent = "SAVED!";
      clearTimeout(savedTimer);
      savedTimer = setTimeout(function () { $("saved").textContent = ""; }, 900);
    });
  }
})();
