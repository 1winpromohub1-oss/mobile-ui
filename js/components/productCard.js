/* productCard.js — reusable e-com product card
   Renders one entry from PRODUCTS (js/config.js). UI-only for now:
   the Add button logs to the console, like the contact form TODO. */

import { el } from "../utils/dom.js";
import { resolveAsset } from "../config.js";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function discountPct(price, mrp) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function createProductCard(product) {
  const pct = discountPct(product.price, product.mrp);
  // API thumbnails are absolute CDN URLs — use them as-is; local
  // assets/ paths still go through resolveAsset() for the root prefix.
  const src =
    /^https?:\/\//.test(product.img || "") === true
      ? product.img
      : resolveAsset(product.img);

  const media = el("div", { class: "product-card__media" }, [
    el("img", {
      class: "product-card__img",
      src,
      alt: product.name,
      loading: "lazy",
      decoding: "async",
    }),
    product.badge
      ? el("span", { class: "product-card__badge", text: product.badge })
      : null,
  ]);

  const priceRow = el("div", { class: "product-card__price-row" }, [
    el("span", { class: "product-card__price", text: inr.format(product.price) }),
    product.mrp
      ? el("s", { class: "product-card__mrp", text: inr.format(product.mrp) })
      : null,
    pct ? el("span", { class: "product-card__off", text: `${pct}% off` }) : null,
  ]);

  const body = el("div", { class: "product-card__body" }, [
    el("h3", { class: "product-card__name", text: product.name }),
    el("p", { class: "product-card__desc", text: product.desc }),
    priceRow,
    el("p", {
      class: "product-card__meta",
      text: `★ ${product.rating.toFixed(1)} · Free delivery`,
    }),
    el("button", {
      class: "btn btn--primary btn--block product-card__add",
      type: "button",
      text: "Add to Cart",
      // TODO: wire to a real cart API once server/ exists (see README).
      onclick: () => console.log(`[cart] add ${product.id}`),
    }),
  ]);

  return el("article", { class: "card product-card" }, [media, body]);
}
