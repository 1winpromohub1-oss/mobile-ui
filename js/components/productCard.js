/* productCard.js — reusable e-com product card. */

import { el } from "../utils/dom.js";
import { resolveAsset, resolveHref } from "../config.js";
import { saveSelectedProduct, formatPrice } from "../utils/products.js";

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
    el("span", { class: "product-card__price", text: formatPrice(product.price) }),
    product.mrp
      ? el("s", { class: "product-card__mrp", text: formatPrice(product.mrp) })
      : null,
    pct ? el("span", { class: "product-card__off", text: `${pct}% off` }) : null,
  ]);

  const openDetails = () => {
    saveSelectedProduct(product);
    window.location.href = resolveHref("pages/product.html");
  };

  const body = el("div", { class: "product-card__body" }, [
    el("h3", { class: "product-card__name", text: product.name }),
    el("p", { class: "product-card__desc", text: product.desc }),
    priceRow,
    el("p", {
      class: "product-card__meta",
      text: `★ ${Number(product.rating ?? 0).toFixed(1)} · Free delivery`,
    }),
    el("button", {
      class: "btn btn--primary btn--block product-card__buy",
      type: "button",
      text: "Buy Now",
      onclick: (event) => {
        event.stopPropagation();
        openDetails();
      },
    }),
  ]);

  const card = el("article", {
    class: "card product-card",
    role: "link",
    tabindex: "0",
    "aria-label": `View ${product.name} details`,
  }, [media, body]);

  card.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) return;
    openDetails();
  });
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openDetails();
  });

  return card;
}
