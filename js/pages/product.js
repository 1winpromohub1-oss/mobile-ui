/* Product details page for the selected home-page product. */

import { el, qs } from "../utils/dom.js";
import { resolveAsset } from "../config.js";
import {
  addToCart,
  formatPrice,
  getSelectedProduct,
} from "../utils/products.js";

function imageSrc(product) {
  return /^https?:\/\//.test(product.img || "")
    ? product.img
    : resolveAsset(product.img);
}

function discountPct(price, mrp) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

function init() {
  const detail = qs("#product-detail");
  if (!detail) return;

  const product = getSelectedProduct();
  if (!product) {
    detail.replaceChildren(
      el("div", { class: "card stack" }, [
        el("h2", { class: "card__title", text: "Product not found" }),
        el("p", {
          class: "card__text",
          text: "Choose a product from the home page to view its details.",
        }),
        el("a", {
          class: "btn btn--primary",
          href: "../index.html",
          text: "Back to shopping",
        }),
      ])
    );
    return;
  }

  const discount = discountPct(product.price, product.mrp);
  const status = el("p", {
    class: "field__hint product-detail__status",
    role: "status",
    "aria-live": "polite",
  });

  const addButton = el("button", {
    class: "btn btn--outline product-detail__action",
    type: "button",
    text: "Add to Cart",
  });
  addButton.addEventListener("click", () => {
    const { itemCount } = addToCart(product);
    status.textContent = `${product.name} added to cart (${itemCount} item${itemCount === 1 ? "" : "s"}).`;
  });

  const buyButton = el("button", {
    class: "btn btn--primary product-detail__action",
    type: "button",
    text: "Buy Now",
  });
  buyButton.addEventListener("click", () => {
    addToCart(product);
    window.location.href = "./cart.html";
  });

  detail.replaceChildren(
    el("article", { class: "card product-detail__card" }, [
      el("div", { class: "product-detail__media" }, [
        el("img", {
          class: "product-detail__img",
          src: imageSrc(product),
          alt: product.name,
          decoding: "async",
        }),
        product.badge
          ? el("span", { class: "product-card__badge", text: product.badge })
          : null,
      ]),
      el("div", { class: "product-detail__body" }, [
        el("h2", { class: "product-detail__name", text: product.name }),
        el("p", { class: "product-detail__desc", text: product.desc }),
        el("div", { class: "product-detail__price-row" }, [
          el("span", {
            class: "product-card__price",
            text: formatPrice(product.price),
          }),
          product.mrp
            ? el("s", {
                class: "product-card__mrp",
                text: formatPrice(product.mrp),
              })
            : null,
          discount
            ? el("span", {
                class: "product-card__off",
                text: `${discount}% off`,
              })
            : null,
        ]),
        el("p", {
          class: "product-card__meta",
          text: `★ ${Number(product.rating ?? 0).toFixed(1)} · Free delivery`,
        }),
        el("div", { class: "product-detail__actions" }, [buyButton, addButton]),
        status,
      ]),
    ])
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}