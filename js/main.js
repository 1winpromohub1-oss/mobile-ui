/* main.js — application entry point
   Assembles the shared app shell (header, main, footer, bottom nav)
   and wires up global behaviors. Every page loads this same script,
   so the shell stays consistent across the whole app. */

import { APP } from "./config.js";
import { syncDocumentTitle, getCurrentPageId } from "./router.js";
import { qs, mount } from "./utils/dom.js";
import { createHeader } from "./components/header.js";
import { createBottomNav } from "./components/bottomNav.js";
import { createFooter } from "./components/footer.js";
import { initTheme, watchSystemTheme } from "./components/themeToggle.js";

/**
 * Render the shared shell into the page.
 *
 * Expected page markup:
 *   <div class="app">
 *     <div id="app-header"></div>
 *     <main class="app-main" id="app-main"> ...page content... </main>
 *     <div id="app-footer"></div>
 *   </div>
 *   <div id="app-bottom-nav"></div>
 */
function renderShell() {
  const headerSlot = qs("#app-header");
  const footerSlot = qs("#app-footer");
  const bottomNavSlot = qs("#app-bottom-nav");

  if (headerSlot) mount(headerSlot, createHeader());
  if (footerSlot) mount(footerSlot, createFooter());
  if (bottomNavSlot) mount(bottomNavSlot, createBottomNav());
}

/** Expose the current page id on <html> for optional per-page CSS hooks. */
function markCurrentPage() {
  document.documentElement.dataset.page = getCurrentPageId();
}

function init() {
  initTheme();
  renderShell();
  markCurrentPage();
  syncDocumentTitle(APP.name);
  watchSystemTheme();
}

// DOM is already parsed because this module is loaded with type="module"
// at the end of <body>, but guard anyway for safety.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}