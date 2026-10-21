// Runs on github.com at document_start, before the page paints.
(function () {
  var T = PIXEL_THEME;
  var html = document.documentElement;
  var current = T.withDefaults();
  var original = null; // GitHub's own color-mode attributes, restored when the theme is off

  // Turn on with defaults right away so there's no flash of GitHub's normal look.
  T.apply(html, current);
  forceLight(current.enabled);

  chrome.storage.local.get(T.STORAGE_KEY, function (data) {
    update(data[T.STORAGE_KEY]);
  });

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "local" && changes[T.STORAGE_KEY]) update(changes[T.STORAGE_KEY].newValue);
  });

  // GitHub can rewrite these attributes (e.g. when it detects your OS theme), so keep it light.
  new MutationObserver(function () {
    if (current.enabled) forceLight(true);
  }).observe(html, { attributes: true, attributeFilter: ["data-color-mode", "data-light-theme", "data-dark-theme"] });

  function update(saved) {
    current = T.apply(html, saved);
    forceLight(current.enabled);
  }

  function forceLight(on) {
    var attrs = ["data-color-mode", "data-light-theme", "data-dark-theme"];
    if (on) {
      if (!original) {
        original = {};
        attrs.forEach(function (a) { original[a] = html.getAttribute(a); });
      }
      setIfDifferent("data-color-mode", "light");
      setIfDifferent("data-light-theme", "light");
      setIfDifferent("data-dark-theme", "light");
    } else if (original) {
      attrs.forEach(function (a) {
        if (original[a] === null) html.removeAttribute(a);
        else html.setAttribute(a, original[a]);
      });
      original = null;
    }
  }

  function setIfDifferent(attr, value) {
    if (html.getAttribute(attr) !== value) html.setAttribute(attr, value);
  }

})();
