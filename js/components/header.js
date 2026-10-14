/* header.js — top app bar component
   Row 1 (every screen size): brand + theme toggle; from md+ it also gains
   the search field and the account links (see responsive.css).
   Row 2 (every screen size): the horizontally scrollable category strip.
   Page navigation itself stays in the bottom nav on phones, so the header
   only carries the Meesho-style chrome. */

import {
  APP,
  CATEGORIES,
  HEADER_MENU,
  SEARCH,
  resolveHref,
  resolveAsset,
} from "../config.js";
import { el } from "../utils/dom.js";
import { createIcon } from "../utils/icons.js";
import { initThemeToggle } from "./themeToggle.js";

/** Build one header account link (Profile, Cart). */
function buildUtilityLink(item) {
  const link = el("a", {
    class: "menu-link",
    href: item.href === "#" ? "#" : resolveHref(item.href),
  }, [
    createIcon(item.id, "menu-link__icon"),
    el("span", {
      class: "menu-link__label",
      text: item.id === "profile" ? getProfileLabel() : item.label,
    }),
  ]);
  if (item.id === "profile") link.dataset.profileLink = "";
  return link;
}

function getProfileLabel() {
  try {
    const profile = JSON.parse(localStorage.getItem("demo-profile") || "null");
    return profile?.name || "Profile";
  } catch {
    return "Profile";
  }
}

/**
 * Build the header search field.
 * UI-only for now: the submit is intercepted, so pressing Enter cannot
 * navigate or reload the page. Point the TODO at a real search route or
 * API once one exists.
 */
function buildSearch() {
  const form = el(
    "form",
    { class: "search app-header__search", role: "search" },
    [
      el("input", {
        class: "search__input",
        type: "search",
        name: "q",
        "aria-label": SEARCH.label,
        placeholder: SEARCH.placeholder,
        autocomplete: "off",
      }),
      el("button", {
        class: "search__btn",
        type: "submit",
        "aria-label": "Search",
        text: "🔍",
      }),
    ]
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // TODO: navigate to results once a search route/API exists.
  });

  return form;
}

/**
 * Build the scrollable category strip (header row 2).
 * A <ul role="list"> keeps it a real list for assistive tech, and the
 * left-to-right scrolling is pure CSS (see .category-scroller).
 */
function buildCategoryStrip() {
  const scroller = el(
    "ul",
    { class: "category-scroller", role: "list" },
    CATEGORIES.map((item) =>
      el(
        "li",
        {},
        el("a", { class: "category-link", href: item.href, text: item.label })
      )
    )
  );

  return el(
    "nav",
    { class: "app-header__cats", "aria-label": "Product categories" },
    scroller
  );
}

/** Create the header element. Returns a DocumentFragment-ready <header>. */
export function createHeader() {
  const themeToggle = initThemeToggle();

  const brand = el(
    "a",
    {
      class: "app-header__brand",
      href: resolveHref("index.html"),
      "aria-label": `${APP.name} home`,
    },
    [
      el("img", {
        class: "app-header__brand-logo",
        src: resolveAsset(APP.brandLogo),
        alt: "", // decorative: the anchor's aria-label already names the link
        width: 156, // intrinsic size of the wordmark artwork
        height: 36,
        decoding: "async",
      }),
    ]
  );

  const header = el("header", { class: "app-header" }, [
    el("div", { class: "app-header__inner" }, [
      // Row 1: brand + search + account links. Always rendered; the search
      // and the account links reveal themselves from md+ (responsive.css).
      el("div", { class: "app-header__row app-header__row--main" }, [
        brand,
        buildSearch(),
        el("div", { class: "app-header__actions" }, [
          el(
            "div",
            { class: "app-header__menu app-header__menu--main" },
            HEADER_MENU.map(buildUtilityLink)
          ),
          themeToggle,
        ]),
      ]),
      // Row 2: the category strip, rendered unconditionally because it is
      // the row's only content now.
      el("div", { class: "app-header__row app-header__row--sub" }, [
        buildCategoryStrip(),
      ]),
    ]),
  ]);

  return header;
}