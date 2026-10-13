/* api/products.js — DummyJSON product catalog (free, no key, CORS-enabled)
   Docs: https://dummyjson.com/docs/products
   Endpoint: GET https://dummyjson.com/products?limit=&skip=&select=
   Total catalog: 194 items (27 groceries, excluded — non-food only).
   Fields used: id, title, description, price (USD), discountPercentage,
   rating, thumbnail, images, category. */

const BASE = "https://dummyjson.com/products";
const SELECT =
  "id,title,description,price,discountPercentage,rating,thumbnail,images,category";

/** Food categories hidden from the grid (groceries = Lemon, Apple, …). */
export const EXCLUDED_CATEGORIES = ["groceries"];

/**
 * Fashion categories pinned to the top of the main grid (same grid, no
 * separate section). 6 × ~5 items = ~30 = one full first page.
 * Garments + shoes + bags: the "cloth items".
 */
export const PRIORITY_CATEGORIES = [
  "mens-shirts",
  "tops",
  "womens-dresses",
  "mens-shoes",
  "womens-shoes",
  "womens-bags",
];

/** Raw page size per API round-trip inside fetchNonFood. */
const PAGE_FETCH = 30;

/** USD → INR budget conversion (×4 keeps demo prices reasonable). */
const USD_TO_INR = 4;

function toINR(usd) {
  return Math.max(1, Math.round(Number(usd) * USD_TO_INR));
}

function badgeFor(discountPct) {
  if (discountPct >= 50) return "Min. 50% Off";
  if (discountPct >= 30) return "Bestseller";
  if (discountPct >= 15) return "Trending";
  return null;
}

/**
 * Map one DummyJSON item to the local card shape
 * ({ id, name, desc, price, mrp, rating, img, badge, category }).
 * mrp is reverse-derived from discountPercentage so the card's
 * strike-through + "% off" row keeps working unchanged.
 */
export function normalizeProduct(item) {
  const price = toINR(item.price ?? 0);
  const pct = Number(item.discountPercentage ?? 0);
  const mrp =
    pct > 0 && pct < 90 ? Math.round(price / (1 - pct / 100)) : null;
  return {
    id: `api-${item.id}`,
    name: item.title ?? "Product",
    desc: item.description ?? "",
    price,
    mrp,
    rating: Number(item.rating ?? 4),
    img: item.thumbnail || item.images?.[0] || "",
    badge: badgeFor(pct),
    category: item.category ?? "",
  };
}

/**
 * Fetch one page of products, sorted cheapest-first by default.
 * Server-side sorting (sortBy/order) stays globally correct across
 * pages: page 1 is the cheapest 30, page 4 the priciest of the 120.
 * @param {{ limit?: number, skip?: number, sortBy?: string, order?: "asc" | "desc" }} opts
 * @returns {Promise<{ items: Array, total: number }>}
 */
export async function fetchProducts({
  limit = 30,
  skip = 0,
  sortBy = "price",
  order = "asc",
} = {}) {
  const url = `${BASE}?limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}&select=${SELECT}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`products fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    items: (data.products ?? []).map(normalizeProduct),
    total: Number(data.total ?? 0),
  };
}

/**
 * Fetch one page of NON-FOOD products, still sorted cheapest-first.
 * DummyJSON has no exclude-category param, so this over-fetches sorted
 * pages and drops EXCLUDED_CATEGORIES ("groceries"), preserving server
 * order — the grid stays exactly low→high with no re-sort.
 * @param {{ limit?: number, serverSkip?: number, sortBy?: string, order?: "asc" | "desc" }} opts
 * @returns {Promise<{ items: Array, serverSkip: number, total: number, exhausted: boolean }>}
 */
export async function fetchNonFood({
  limit = 30,
  serverSkip = 0,
  sortBy = "price",
  order = "asc",
} = {}) {
  const kept = [];
  let offset = serverSkip;
  let total = 0;
  let exhausted = false;

  while (kept.length < limit) {
    const { items, total: apiTotal } = await fetchProducts({
      limit: Math.max(limit, PAGE_FETCH),
      skip: offset,
      sortBy,
      order,
    });
    total = apiTotal;
    if (items.length === 0) {
      exhausted = true;
      break;
    }
    offset += items.length;
    for (const item of items) {
      if (EXCLUDED_CATEGORIES.includes(item.category)) continue;
      kept.push(item);
      if (kept.length >= limit) break;
    }
    if (offset >= total) {
      exhausted = true;
      break;
    }
  }

  return { items: kept, serverSkip: offset, total, exhausted };
}

/**
 * Fetch one page for the fashion-first grid (single grid, no sections).
 * Phase 1: page per PRIORITY_CATEGORIES entry (each already price-sorted
 * server-side), merged + sorted low→high, sliced into `limit` pages from
 * `prioritySkip`. Phase 2 (priority exhausted): normal non-food feed with
 * priority ids skipped. Each phase stays internally price-sorted.
 * @param {{ limit?: number, state?: { prioritySkip?: number, serverSkip?: number, seenPriority?: Array<string> } }} opts
 * @returns {Promise<{ items: Array, state: Object, total: number, exhausted: boolean, phase: string }>}
 */
export async function fetchFashionFirst({ limit = 30, state = {} } = {}) {
  const next = {
    prioritySkip: state.prioritySkip ?? 0,
    serverSkip: state.serverSkip ?? 0,
    seenPriority: state.seenPriority ?? [],
  };

  // Phase 1 — fashion block (cached per session after first build).
  if (!state.priorityAll) {
    const perCat = await Promise.all(
      PRIORITY_CATEGORIES.map((cat) => fetchCategory(cat))
    );
    next.priorityAll = perCat
      .flat()
      .sort((a, b) => a.price - b.price);
  } else {
    next.priorityAll = state.priorityAll;
  }

  const remaining = next.priorityAll.slice(next.prioritySkip);
  if (remaining.length > 0) {
    const page = remaining.slice(0, limit);
    next.prioritySkip += page.length;
    next.seenPriority = [
      ...next.seenPriority,
      ...page.map((item) => item.id),
    ];
    return {
      items: page,
      state: next,
      total: next.priorityAll.length,
      exhausted: false,
      phase: "fashion",
    };
  }

  // Phase 2 — everything else, price-sorted, priority ids skipped.
  const seen = new Set(next.seenPriority);
  const kept = [];
  let offset = next.serverSkip;
  let total = 0;
  let exhausted = false;
  while (kept.length < limit) {
    const { items, total: apiTotal } = await fetchProducts({
      limit: Math.max(limit, PAGE_FETCH),
      skip: offset,
      sortBy: "price",
      order: "asc",
    });
    total = apiTotal;
    if (items.length === 0) {
      exhausted = true;
      break;
    }
    offset += items.length;
    for (const item of items) {
      if (EXCLUDED_CATEGORIES.includes(item.category)) continue;
      if (seen.has(item.id)) continue;
      kept.push(item);
      if (kept.length >= limit) break;
    }
    if (offset >= total) {
      exhausted = true;
      break;
    }
  }
  next.serverSkip = offset;
  return { items: kept, state: next, total, exhausted, phase: "rest" };
}

/**
 * Fetch all items of one category (e.g. "sports-accessories" for the
 * Toys & Gifts strip). Single small request — no pagination needed.
 * @param {string} category
 * @returns {Promise<Array>} normalized, grocery-filtered items
 */
export async function fetchCategory(category) {
  const url = `${BASE}/category/${category}?select=${SELECT}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`category fetch failed: ${res.status}`);
  const data = await res.json();
  return (data.products ?? [])
    .map(normalizeProduct)
    .filter((item) => !EXCLUDED_CATEGORIES.includes(item.category));
}
