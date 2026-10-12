/* pages/payment.js — UI-only checkout for a Spin & Win prize. */

import { el, qs } from "../utils/dom.js";
import { resolveAsset } from "../config.js";

function init() {
  const orderPanel = qs("#payment-order");
  if (!orderPanel) return;

  let order;
  try {
    order = JSON.parse(sessionStorage.getItem("spin-win-order") || "null");
  } catch {
    order = null;
  }

  if (!order?.delivery && order?.prize) {
    window.location.replace("./address.html");
    return;
  }

  if (!order?.delivery || !order?.prize) {
    orderPanel.replaceChildren(
      el("h2", { class: "card__title", text: "No prize details found" }),
      el("p", { class: "card__text", text: "Spin the wheel and enter your delivery address to start checkout." }),
      el("a", { class: "btn btn--primary", href: "../index.html", text: "Back to Spin & Win" })
    );
    return;
  }

  const { delivery, prize } = order;
  const addressLines = [delivery.name, delivery.phone, delivery.address, delivery.city, delivery.postalCode];
  const summary = el("section", { class: "card stack" }, [
    prize.img ? el("img", { class: "spin-win__win-image", src: resolveAsset(prize.img), alt: prize.label }) : null,
    el("h2", { class: "card__title", text: prize.label }),
    el("p", { class: "card__text", text: prize.result }),
    el("h3", { class: "card__title", text: "Delivering to" }),
    ...addressLines.map((line) => el("p", { class: "card__text", text: line })),
  ]);

  const paymentForm = el("form", { class: "stack", id: "payment-form" }, [
    el("div", { class: "field" }, [
      el("label", { class: "field__label", for: "payment-method", text: "Payment method" }),
      el("select", { class: "field__input", id: "payment-method", name: "method", required: true }, [
        el("option", { value: "", text: "Choose a demo payment method", disabled: true, selected: true }),
        el("option", { value: "upi", text: "UPI (demo)" }),
        el("option", { value: "card", text: "Credit or debit card (demo)" }),
        el("option", { value: "cod", text: "Cash on delivery (demo)" }),
      ]),
    ]),
    el("p", { class: "field__hint", text: "This is a UI-only demo. No payment will be collected and no order will be placed." }),
    el("button", { class: "btn btn--primary btn--block", type: "submit", text: "Confirm demo checkout" }),
    el("p", { id: "payment-status", class: "field__hint", role: "status", "aria-live": "polite" }),
  ]);

  orderPanel.replaceChildren(summary, paymentForm);
  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!paymentForm.reportValidity()) return;
    qs("#payment-status").textContent = "Demo checkout complete. No payment was processed.";
    sessionStorage.removeItem("spin-win-order");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}