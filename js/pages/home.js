/* pages/home.js - page-specific behavior for the home page
   The "Spin & Win" wheel belongs to the home hero banner only, so it is
   mounted here rather than in the shared shell (js/main.js), the same way
   js/pages/contact.js owns the contact form. The product grid is also a
   home-only concern: it loads 100+ non-food items from the DummyJSON
   catalog (js/api/products.js) into #product-grid via infinite scroll,
   plus a Toys & Gifts strip (sports-accessories, real photos) below it,
   and falls back to the local PRODUCTS picks when offline. */

import { qs, el } from "../utils/dom.js";
import { mount } from "../utils/dom.js";
import { PRODUCTS } from "../config.js";
import {
  fetchFashionFirst,
  fetchCategory,
  EXCLUDED_CATEGORIES,
  PRIORITY_CATEGORIES,
} from "../api/products.js";
import { createSpinWheel } from "../components/spinWheel.js";
import { createProductCard } from "../components/productCard.js";

const PAGE_SIZE = 30;
const MAX_ITEMS = 120; // "at least 100" — ~4 pages of non-food
// Verified live: 27 groceries in the 194-item catalog (see api/products.js).
const GROCERY_COUNT = 27;

function skeletonCard() {
  return el("article", { class: "card product-card", "aria-hidden": "true" }, [
    el("div", { class: "product-card__media skeleton" }),
    el("div", { class: "product-card__body" }, [
      el("div", { class: "skeleton skeleton--line" }),
      el("div", { class: "skeleton skeleton--line skeleton--short" }),
      el("div", { class: "skeleton skeleton--line skeleton--short" }),
    ]),
  ]);
}

function showSkeletons(grid, n = 8) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) frag.append(skeletonCard());
  grid.replaceChildren(frag);
}

function appendProducts(grid, items) {
  const frag = document.createDocumentFragment();
  for (const product of items) frag.append(createProductCard(product));
  grid.append(frag);
}

async function initProductGrid() {
  const grid = qs("#product-grid");
  const status = qs("#product-status");
  const sentinel = qs("#product-sentinel");
  if (!grid) return;

  let shown = 0;
  let feedState = {}; // fashion-first cursor (priority + server offsets)
  let total = 0;
  let exhausted = false;
  let loading = false;
  let done = false;
  let observer = null;

  const estNonFood = () => {
    // Phase 1 reports the fashion-block size; the full non-food estimate
    // (194 − 27 groceries) only applies once phase 2 starts.
    if (feedState.priorityAll && feedState.prioritySkip < feedState.priorityAll.length)
      return MAX_ITEMS;
    return total > 0 ? Math.max(0, total - GROCERY_COUNT) : MAX_ITEMS;
  };
  const cap = () => Math.min(estNonFood(), MAX_ITEMS);
  const hasMore = () => !done && !exhausted && (total === 0 || shown < cap());

  const paintStatus = (msg) => {
    if (status) status.textContent = msg;
  };
  const setBusy = (busy) => grid.setAttribute("aria-busy", String(busy));

  const stop = (msg) => {
    done = true;
    if (observer) observer.disconnect();
    if (sentinel) sentinel.remove();
    setBusy(false);
    if (msg) paintStatus(msg);
  };

  async function loadMore() {
    if (loading || done) return;
    loading = true;
    setBusy(true);
    if (shown === 0) {
      showSkeletons(grid);
      paintStatus("Loading products… scroll for more.");
    } else {
      paintStatus(`Loading more products… (${shown} of ${cap()} shown)`);
    }
    try {
      const {
        items,
        state: nextState,
        total: apiTotal,
        exhausted: apiDone,
        phase,
      } = await fetchFashionFirst({ limit: PAGE_SIZE, state: feedState });
      total = phase === "fashion" ? apiTotal : apiTotal;
      exhausted = apiDone;
      feedState = nextState;
      if (shown === 0) grid.replaceChildren();
      appendProducts(grid, items);
      shown += items.length;
      const orderNote =
        phase === "fashion"
          ? "fashion first, price low to high"
          : "fashion on top, rest price low to high";
      if (items.length === 0 || exhausted || shown >= cap()) {
        stop(`You've seen all ${shown} non-food products (${orderNote}).`);
      } else {
        paintStatus(
          `Showing ${shown} of ~${cap()} non-food products, ${orderNote} — keep scrolling.`
        );
      }
    } catch (err) {
      console.warn("[products] API failed, using local picks:", err);
      // Offline/API-down fallback: local assets/ picks so the page is
      // never empty (same UI-only approach as the contact form).
      if (shown === 0) {
        grid.replaceChildren();
        // Offline: fashion keywords first (no categories locally), then price.
        const isFashion = (p) =>
          PRIORITY_CATEGORIES.some((cat) =>
            `${p.name} ${p.desc}`.toLowerCase().includes(cat.split("-")[0])
          ) ||
          /shirt|dress|shoe|bag|kurti|saree|jean|top|heel|sandal/i.test(
            `${p.name} ${p.desc}`
          );
        appendProducts(
          grid,
          [...PRODUCTS].sort(
            (a, b) =>
              Number(isFashion(b)) - Number(isFashion(a)) || a.price - b.price
          )
        );
        shown = PRODUCTS.length;
        stop(
          "You're offline — showing saved picks. Connect and reload for 100+ items."
        );
      } else {
        paintStatus("Couldn't load more — check your connection and retry.");
      }
    } finally {
      loading = false;
      if (!done) setBusy(false);
    }
  }

  // Infinite scroll: pre-fetch the next page ~600px before the sentinel
  // scrolls into view. The loading flag dedupes rapid-fire callbacks
  // from fast scrolling. Fall back to loading everything eagerly when
  // IntersectionObserver is unavailable.
  if (sentinel && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(sentinel);
  } else if (sentinel) {
    sentinel.remove();
  }
  await loadMore();
  // No observer (old browser or missing sentinel): keep paging until full.
  if (!observer) {
    while (hasMore()) await loadMore();
  }
}

function init() {
  const slot = qs("#hero-spin");
  if (slot) {
    mount(slot, createSpinWheel());
    maybeAutoOpenBigSpin(slot);
  }
  initProductGrid();
  initToysStrip();
}

/**
 * Open the full-screen wheel instantly on every home-page load.
 * The big spin already exists as an overlay; this only triggers its normal
 * launch button automatically, so close/Escape/payment behavior stays the same.
 */
function maybeAutoOpenBigSpin(slot) {
  const launchButton = slot.querySelector(".spin-win__stage button");
  if (!launchButton) return;

  launchButton.click();
}

/**
 * Toys & Gifts strip: all sports-accessories in one request, rendered
 * as compact cards in a horizontal scroller. Real CDN photos (not the
 * grey MockServer placeholders). Hidden section stays hidden on failure.
 */
async function initToysStrip() {
  const section = qs("#toys-section");
  const track = qs("#toys-track");
  if (!section || !track) return;
  try {
    const items = await fetchCategory("sports-accessories");
    if (items.length === 0) return;
    const frag = document.createDocumentFragment();
    for (const item of items) {
      frag.append(createProductCard({ ...item, desc: item.name }));
    }
    track.replaceChildren(frag);
    section.hidden = false;
  } catch (err) {
    console.warn("[toys] strip failed, keeping it hidden:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}