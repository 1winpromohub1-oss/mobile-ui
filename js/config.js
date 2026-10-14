/* config.js - central app configuration
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
  { id: "home", label: "Home", href: "index.html" },
  { id: "about", label: "About", href: "pages/about.html" },
  { id: "contact", label: "Contact", href: "pages/contact.html" },
  { id: "profile", label: "Profile", href: "pages/profile.html" },
];

/**
 * Header utility menu (Meesho-style top bar).
 * Rendered in the header's top row, from md+ only (see responsive.css).
 * Cart is a local demo flow for now; its contents stay in this browser.
 */
export const HEADER_MENU = [
  { id: "profile", label: "Profile", href: "pages/profile.html" },
  { id: "cart", label: "Cart", href: "pages/cart.html" },
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
 * Home-page product listing (e-com grid).
 * UI-only for now, like SPIN_WHEEL and the contact form: static data,
 * no backend. Images live in assets/ and are resolved by the card
 * component with resolveAsset(). `mrp` is the struck-through price used
 * to derive the discount %; omit it when there is no discount.
 */
export const PRODUCTS = [
  {
    id: "buds",
    name: "AirBeat Bluetooth Earbuds",
    desc: "True wireless earbuds with 45H playtime & ENC mic",
    price: 1299,
    mrp: 2999,
    rating: 4.3,
    badge: "Bestseller",
    img: "assets/buds.webp",
  },
  {
    id: "shoes",
    name: "StreetRun Sports Shoes",
    desc: "Lightweight running shoes for men, anti-skid sole",
    price: 899,
    mrp: 1999,
    rating: 4.1,
    badge: "Trending",
    img: "assets/shoes.webp",
  },
  {
    id: "smartwatch",
    name: "PulseFit Smartwatch",
    desc: '1.85" HD display, BT calling & 7-day battery',
    price: 1499,
    mrp: 3999,
    rating: 4.4,
    badge: "New",
    img: "assets/smartwath.webp",
  },
  {
    id: "lehenga",
    name: "Embroidered Lehenga Set",
    desc: "Women's festive lehenga choli with dupatta",
    price: 1799,
    mrp: 3499,
    rating: 4.2,
    img: "assets/lehanga set.webp",
  },
  {
    id: "baby-car",
    name: "Baby Ride-On Car",
    desc: "Kids push car with horn, storage & safety rails",
    price: 1199,
    mrp: 2499,
    rating: 4.5,
    img: "assets/baby kar.webp",
  },
  {
    id: "washing-machine",
    name: "Washer 7kg Front Load",
    desc: "Fully automatic washer, 15 wash programs",
    price: 18490,
    mrp: 24990,
    rating: 4.3,
    img: "assets/washing mahine.webp",
  },
  {
    id: "cycle",
    name: "CityRide Bicycle 26T",
    desc: "Single-speed city cycle with dual brakes",
    price: 5499,
    mrp: 8999,
    rating: 4.0,
    img: "assets/xyxle.webp",
  },
  {
    id: "toy-car",
    name: "Turbo RC Toy Car",
    desc: "Rechargeable stunt car with 360° rotation",
    price: 699,
    mrp: 1499,
    rating: 4.2,
    badge: "Min. 50% Off",
    img: "assets/toy-car.jpg",
  },
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
  // Real ₹200 UPI payment link (UpiLinks, VPA me.sho@ptyes). The demo button
  // opens this in a new tab; the wheel still unlocks locally (UI-only, no
  // verification). To re-point it, update the VPA inside the UpiLinks
  // dashboard or paste the new payment-link URL here.
  paymentUrl: "https://upilinks.in/payment-link/upi1919387274",
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
      label: "Neckband",
      img: "assets/spin-neckband.jpg",
      bg: "#570d48",
      text: "#ffd166",
      result: "You won a neckband!",
    },
    {
      label: "Shoes",
      img: "assets/spin-shoes.jpg",
      bg: "#ffd166",
      text: "#3a0530",
      result: "You won shoes!",
    },
    {
      label: "Washing machine",
      img: "assets/washing mahine.webp",
      bg: "#570d48",
      text: "#ffd166",
      result: "You won a washing machine!",
    },
    {
      label: "₹200",
      bg: "#ffd166",
      text: "#3a0530",
      result: "You won ₹200!",
    },
  ],
};