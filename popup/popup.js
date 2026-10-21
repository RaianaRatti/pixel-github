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
        s.style.background = p.colors[k];
        strip.appendChild(s);
      });
      btn.appendChild(strip);
      btn.appendChild(document.createTextNode(p.name));
      btn.addEventListener("click", function () {
        settings.preset = id;
        settings.colors = Object.assign({}, p.colors);
        save();
      });
      $("presets").appendChild(btn);
    });

    // One row per color: picker + name + hex field
    T.COLOR_KEYS.forEach(function (c) {
      var row = document.createElement("div");
      row.className = "color-row";
      row.innerHTML =
        '<input type="color" aria-label="' + c.label + '">' +
        '<span class="color-name"><b>' + c.label + "</b><small>" + c.hint + "</small></span>" +
        '<input type="text" spellcheck="false" maxlength="7" pattern="#[0-9a-fA-F]{6}" aria-label="' + c.label + ' hex">';
      var picker = row.children[0];
      var hex = row.children[2];
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

    $("enabled").addEventListener("change", function () { settings.enabled = this.checked; save(); });

    $("reset").addEventListener("click", function () {
      settings = T.withDefaults();
      save();
    });
  }

  function setColor(key, value, skipField) {
    settings.colors[key] = value;
    settings.preset = matchingPreset(settings.colors);
    save(skipField);
  }

  // If hand-picked colors happen to equal a preset, light that preset up again.
  function matchingPreset(colors) {
    return Object.keys(T.PRESETS).find(function (id) {
      var p = T.PRESETS[id].colors;
      return Object.keys(p).every(function (k) { return p[k].toLowerCase() === String(colors[k]).toLowerCase(); });
    }) || "custom";
  }

  function render(skipField) {
    T.apply(document.documentElement, settings);

    document.querySelectorAll(".preset").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.preset === settings.preset));
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
