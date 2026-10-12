/* config.js â€” central app configuration
   Edit this file to change the app name, navigation, and behavior
   without touching component or page code. */

export const APP = {
  name: "Meesho",
  shortName: "Meesho",
  brandLogo: "assets/icons/meeshoLogo.svg", // brand wordmark shown in the header
  description: "A mobile-first UI base architecture.",
  year: new Date().getFullYear(),
};

/**
 * Primary navigation definition.
 * Feeds the bottom nav (mobile). The header carries its own chrome via
 * HEADER_MENU below, so adding an item here only affects the bottom nav.
 */
export const NAV_ITEMS = [
  { id: "home", label: "Home", href: "index.html", icon: "ðŸ " },
  { id: "about", label: "About", href: "pages/about.html", icon: "â„¹ï¸" },
  { id: "contact", label: "Contact", href: "pages/contact.html", icon: "âœ‰ï¸" },
  { id: "profile", label: "Profile", href: "pages/profile.html", icon: "ðŸ‘¤" },
];

/**
 * Header utility menu (Meesho-style top bar).
 * Rendered in the header's top row, from md+ only (see responsive.css).
 * These have no target pages yet, so href stays "#" - the same
 * UI-only-first approach as the contact form.
 */
export const HEADER_MENU = [
  { id: "profile", label: "Profile", href: "pages/profile.html", icon: "ðŸ‘¤" },
  { id: "cart", label: "Cart", href: "#", icon: "ðŸ›’" },
];

/**
 * Product category strip - the header's second row, scrollable left to
 * right at every screen size (see .category-scroller in components.css).
 * UI-only for now: these have no landing pages, so href stays "#".
 */
export const CATEGORIES = [
  { label: "Jewellery", href: "#" },
  { label: "Men Fashion", href: "#" },
  { label: "Kids", href: "#" },
  { label: "Footwear", href: "#" },
  { label: "Beauty & Personal Care", href: "#" },
  { label: "Grocery", href: "#" },
  { label: "Electronics", href: "#" },
  { label: "Innerwear & Nightwear", href: "#" },
  { label: "Kitchen & Appliances", href: "#" },
  { label: "Bags & Luggage", href: "#" },
  { label: "Healthcare", href: "#" },
  { label: "Stationery & Office Supplies", href: "#" },
  { label: "Bike & Car", href: "#" },
  { label: "Furniture", href: "#" },
];

/**
 * Header search field (md+ only).
 * UI-only until a backend exists: header.js intercepts the submit, so
 * nothing is sent anywhere.
 */
export const SEARCH = {
  label: "Search products",
  placeholder: "Try Saree, Kurti or Search by Product Code",
};

/**
 * Compute the correct relative prefix back to the project root.
 * Pages inside /pages need to reference ../css/... and ../index.html,
 * while the root index.html uses ./...
 */
export function rootPrefix() {
  const path = window.location.pathname;
  // If we're inside a sub-directory (e.g. /pages/), go up one level.
  return /\/pages\//.test(path) ? "../" : "./";
}

/**
 * Resolve a root-relative href (as used in NAV_ITEMS, relative to project
 * root) into a path that works from the current page.
 */
export function resolveHref(href) {
  return rootPrefix() + href;
}

/**
 * Resolve an asset path (css/js/images) from the project root.
 */
export function resolveAsset(path) {
  return rootPrefix() + path.replace(/^\.\//, "");
}

/**
 * Home-page "Spin & Win" promo wheel (see js/components/spinWheel.js).
 *
 * Each entry in `prizes` is one equally sized slice, filled by the prize's
 * product photo (`img`) or, for a prize with no artwork, by its short `label`
 * drawn on the slice in `text`. `bg` is the slice colour, and
 * `result` is the sentence shown in the fourth part of the banner (and
 * announced) when that slice wins - keep it brief, it has to fit a quarter of
 * a phone banner.
 *
 * The odds follow the array itself: one entry is one slice and every slice
 * wins, so listing a prize twice simply doubles its chance, with no second
 * weight list to keep in sync. Images live in assets/ and are resolved by the
 * component with resolveAsset().
 *
 * UI-only for now, like the contact form: a spin is random and local, the
 * result is logged, and no coupon is actually issued.
 */
export const SPIN_WHEEL = {
  title: "Spin & Win",
  countdownSeconds: 120,
  spinPriceRupees: 200,
  spinMs: 3800, // fed into --spin-duration, so CSS and the callback share it
  turns: 5, // whole turns before landing, so even a small win feels big
  prizes: [
    {
      label: "Smartwatch",
      img: "assets/spin-watch.jpg",
      bg: "#570d48",
      text: "#ffd166",
      result: "You won a smartwatch!",
    },
    {
      label: "Earbuds",
      img: "assets/spin-earbuds.jpg",
      bg: "#ffd166",
      text: "#3a0530",
      result: "You won earbuds!",
    },
    {
      label: "Shoes",
      img: "assets/toy-car.jpg",
      bg: "#570d48",
      text: "#ffd166",
      result: "You won shoes!",
    },
    {
      label: "Washing machine",
      img: "assets/washing mahine.webp",
      bg: "#ffd166",
      text: "#3a0530",
      result: "You won a washing machine!",
    },
    {
      label: "Surprise gift",
      img: "assets/spin-gift.jpg",
      bg: "#570d48",
      text: "#ffd166",
      result: "You won a surprise gift!",
    },
    {
      label: "â‚¹200",
      img: "assets/spin-prize.jpg",
      bg: "#ffd166",
      text: "#3a0530",
      result: "You won â‚¹200!",
    },
  ],
};