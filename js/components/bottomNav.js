/* bottomNav.js — mobile bottom navigation bar
   Fixed to the bottom of the viewport, thumb-friendly, with active
   state highlighting. Hidden on md+ screens (see responsive.css), so
   these items are the phone-only route between pages. */

import { NAV_ITEMS, resolveHref } from "../config.js";
import { isActive } from "../router.js";
import { el } from "../utils/dom.js";
import { createIcon } from "../utils/icons.js";

/** Build one bottom-nav item. */
function buildNavItem(item) {
  const active = isActive(item.id);
  return el(
    "a",
    {
      class: `nav-item${active ? " is-active" : ""}`,
      href: resolveHref(item.href),
      "aria-current": active ? "page" : null,
      "aria-label": item.label,
    },
    [
      createIcon(item.id, "nav-item__icon"),
      el("span", { class: "nav-item__label", text: item.label }),
    ]
  );
}

/** Create the bottom navigation element. */
export function createBottomNav() {
  const nav = el(
    "nav",
    {
      class: "bottom-nav",
      "aria-label": "Primary",
      role: "navigation",
    },
    [
      el(
        "div",
        { class: "bottom-nav__inner" },
        NAV_ITEMS.map(buildNavItem)
      ),
    ]
  );

  return nav;
}