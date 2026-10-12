/* router.js — navigation state for the multi-page shell
   This base uses separate HTML files (not an SPA), so the "router"
   is responsible for detecting the current page and marking the
   matching navigation item as active. Swap this for a real router
   (or React Router) later without changing the nav components' API. */

import { NAV_ITEMS } from "./config.js";

/**
 * Determine the logical page id for the current URL.
 * Matches the current file path against NAV_ITEMS hrefs.
 * Falls back to the first item (home).
 */
export function getCurrentPageId() {
  const current = window.location.pathname.split("/").pop() || "index.html";

  const match = NAV_ITEMS.find((item) => {
    const target = item.href.split("/").pop();
    return target === current;
  });

  return match ? match.id : NAV_ITEMS[0].id;
}

/** True if the given nav item id represents the active page. */
export function isActive(itemId) {
  return itemId === getCurrentPageId();
}

/**
 * Set or update the document title based on the current page.
 * Keeps the tab title in sync with navigation.
 */
export function syncDocumentTitle(baseTitle) {
  const active = NAV_ITEMS.find((item) => item.id === getCurrentPageId());
  const pageName = active ? active.label : "";
  document.title =
    getCurrentPageId() === "home"
      ? baseTitle
      : `${pageName} · ${baseTitle}`;
}

/**
 * Handle in-app navigation clicks.
 * Allows components to intercept nav clicks (e.g. for future SPA routing
 * or view transitions) while still allowing default browser navigation.
 */
export function navigate(href) {
  window.location.href = href;
}