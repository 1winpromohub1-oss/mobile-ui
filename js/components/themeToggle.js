/* themeToggle.js — light/dark theme toggle button
   Persists the user's choice in localStorage and applies it via
   the `data-theme` attribute on <html> (see variables.css). */

import { el, qs } from "../utils/dom.js";

/* The no-flash bootstrap (js/theme-init.js) is a classic script in <head>
   that runs before this module, so reuse its values to keep the storage
   key and theme names from ever drifting apart. The literals below are
   only a fallback for a page that omits the bootstrap. */
const bootstrap = window.MUI_THEME || {};
const STORAGE_KEY = bootstrap.key || "mui-theme";
const LIGHT = bootstrap.light || "light";
const DARK = bootstrap.dark || "dark";

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage may be unavailable (private mode) — ignore */
  }
}

function preferredTheme() {
  const stored = getStoredTheme();
  if (stored === LIGHT || stored === DARK) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

/** Apply the persisted/preferred theme as early as possible. */
export function initTheme() {
  applyTheme(preferredTheme());
}

/**
 * Create and wire up the theme toggle button.
 * Updates its icon, ARIA label, and the document theme on click.
 */
export function initThemeToggle() {
  const button = el("button", {
    class: "icon-btn",
    type: "button",
    "aria-label": "Toggle color theme",
    title: "Toggle theme",
  });

  const render = () => {
    const theme = document.documentElement.dataset.theme || LIGHT;
    button.textContent = theme === DARK ? "☀️" : "🌙";
    button.setAttribute(
      "aria-pressed",
      theme === DARK ? "true" : "false"
    );
  };

  button.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme || LIGHT;
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next);
    storeTheme(next);
    render();
  });

  render();
  return button;
}

/** Optional: keep the button icon in sync if the OS theme changes. */
export function watchSystemTheme() {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener?.("change", (e) => {
    if (getStoredTheme()) return; // user made an explicit choice
    applyTheme(e.matches ? DARK : LIGHT);
    const btn = qs(".icon-btn");
    if (btn) btn.textContent = e.matches ? "☀️" : "🌙";
  });
}