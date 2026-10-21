// Runs on github.com at document_start, before the page paints.
(function () {
  var T = PIXEL_THEME;
  var html = document.documentElement;
  var current = T.withDefaults();
  var original = null; // GitHub's own color-mode attributes, restored when the theme is off

  // Turn on with defaults right away so there's no flash of GitHub's normal look.
  T.apply(html, current);
  forceLight(current.enabled);
  injectFonts();

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

  // 8-bit avatars: ask GitHub's avatar server for a tiny image and let CSS scale it up pixelated.
  var avatarObserver = new MutationObserver(function (mutations) {
    if (!pixelAvatarsOn()) return;
    mutations.forEach(function (m) {
      if (m.type === "attributes") pixelate(m.target);
      else m.addedNodes.forEach(function (n) { if (n.nodeType === 1) scanAvatars(n); });
    });
  });
  avatarObserver.observe(html, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });

  function update(saved) {
    current = T.apply(html, saved);
    forceLight(current.enabled);
    if (pixelAvatarsOn()) scanAvatars(document);
    else restoreAvatars();
  }

  function pixelAvatarsOn() {
    return current.enabled && current.effects.pixelAvatars;
  }

  function scanAvatars(root) {
    if (root.tagName === "IMG") pixelate(root);
    if (root.querySelectorAll) root.querySelectorAll('img[src*="avatars.githubusercontent.com"]').forEach(pixelate);
  }

  function pixelate(img) {
    if (img.tagName !== "IMG" || !/avatars\.githubusercontent\.com/.test(img.src)) return;
    var displayed = parseInt(img.getAttribute("width"), 10) || img.getBoundingClientRect().width || 40;
    var tiny = Math.max(10, Math.min(48, Math.round(displayed / 4)));
    var url;
    try { url = new URL(img.src); } catch (e) { return; }
    if (img.dataset.pxAvatar && url.searchParams.get("s") === String(tiny)) return; // already done
    if (!img.dataset.pxAvatar) {
      img.dataset.pxOrigSrc = img.src;
      if (img.hasAttribute("srcset")) img.dataset.pxOrigSrcset = img.getAttribute("srcset");
    }
    img.dataset.pxAvatar = "1";
    img.removeAttribute("srcset");
    url.searchParams.set("s", tiny);
    img.src = url.toString();
  }

  function restoreAvatars() {
    document.querySelectorAll("img[data-px-avatar]").forEach(function (img) {
      if (img.dataset.pxOrigSrcset) img.setAttribute("srcset", img.dataset.pxOrigSrcset);
      if (img.dataset.pxOrigSrc) img.src = img.dataset.pxOrigSrc;
      delete img.dataset.pxAvatar;
      delete img.dataset.pxOrigSrc;
      delete img.dataset.pxOrigSrcset;
    });
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

  // Fonts are bundled with the extension because GitHub's CSP blocks Google Fonts.
  function injectFonts() {
    try {
      T.FONT_FILES.forEach(function (f) {
        var face = new FontFace(f.family, "url('" + chrome.runtime.getURL(f.file) + "') format('woff2')", { weight: f.weight, display: "swap" });
        document.fonts.add(face);
        face.load().catch(function () {});
      });
      return;
    } catch (e) {
      // Fall back to a <style> tag below.
    }
    var css = T.FONT_FILES.map(function (f) {
      return "@font-face{font-family:'" + f.family + "';src:url('" + chrome.runtime.getURL(f.file) +
        "') format('woff2');font-weight:" + f.weight + ";font-display:swap;}";
    }).join("\n");
    var style = document.createElement("style");
    style.id = "px-fonts";
    style.textContent = css;
    (document.head || html).appendChild(style);
  }
})();
