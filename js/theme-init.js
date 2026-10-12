/* theme-init.js - no-flash theme bootstrap
   Loaded as a CLASSIC (non-module) script from <head> on every page so it
   executes while the document is still parsing, before the first paint.
   Module scripts are deferred, which would let the browser paint the
   default light theme first and only then swap to the stored preference
   (a "flash of wrong theme" on dark-mode devices).

   This mirrors preferredTheme() in components/themeToggle.js and owns the
   shared storage key; that module reads the key back from window.MUI_THEME
   so the two cannot drift apart. themeToggle.js still applies the theme on
   load as a safety net for pages that do not include this script. */

(function () {
  "use strict";

  var STORAGE_KEY = "mui-theme";
  var LIGHT = "light";
  var DARK = "dark";

  function storedTheme() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null; // storage can be unavailable (private mode)
    }
  }

  function systemPrefersDark() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  var stored = storedTheme();
  var theme =
    stored === LIGHT || stored === DARK
      ? stored
      : systemPrefersDark()
        ? DARK
        : LIGHT;

  document.documentElement.dataset.theme = theme;

  // Expose the shared key/values to the module-based toggle.
  window.MUI_THEME = { key: STORAGE_KEY, light: LIGHT, dark: DARK };
})();
