/* Local demo cart page. */

import { el, qs } from "../utils/dom.js";
import { resolveAsset } from "../config.js";
import { formatPrice, getCart, removeFromCart } from "../utils/products.js";

function imageSrc(product) {
  return /^https?:\/\//.test(product.img || "")
    ? product.img
    : resolveAsset(product.img);
}

function render() {
  const content = qs("#cart-content");
  if (!content) return;

  const cart = getCart();
  if (cart.length === 0) {
    content.replaceChildren(
      el("div", { class: "card stack" }, [
        el("h2", { class: "card__title", text: "Your cart is empty" }),
        el("p", {
          class: "card__text",
          text: "Open a product to add it to your cart.",
        }),
        el("a", {
          class: "btn btn--primary",
          href: "../index.html",
          text: "Continue shopping",
        }),
      ])
    );
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  const items = el("div", { class: "cart-list" });
  cart.forEach((item) => {
    const removeButton = el("button", {
      class: "btn btn--outline cart-item__remove",
      type: "button",
      text: "Remove",
    });
    removeButton.addEventListener("click", () => {
      removeFromCart(item.id);
      render();
    });

    items.append(
      el("article", { class: "card cart-item" }, [
        el("img", {
          class: "cart-item__img",
          src: imageSrc(item),
          alt: item.name,
          loading: "lazy",
          decoding: "async",
        }),
        el("div", { class: "cart-item__body" }, [
          el("h2", { class: "cart-item__name", text: item.name }),
          el("p", {
            class: "cart-item__meta",
            text: `${item.quantity} × ${formatPrice(item.price)}`,
          }),
          removeButton,
        ]),
      ])
    );
  });

  content.replaceChildren(
    items,
    el("div", { class: "card cart-summary stack" }, [
      el("div", { class: "cart-summary__row" }, [
        el("span", { text: "Total" }),
        el("strong", { text: formatPrice(total) }),
      ]),
      el("button", {
        class: "btn btn--primary btn--block",
        type: "button",
        text: "Proceed to Checkout",
        onclick: () => {
          const status = qs("#cart-status");
          if (status) status.textContent = "Checkout is ready for backend integration.";
        },
      }),
      el("p", {
        id: "cart-status",
        class: "field__hint",
        role: "status",
        "aria-live": "polite",
      }),
    ])
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", render);
} else {
  render();
}