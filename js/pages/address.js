/* pages/address.js — timed delivery-address step for Spin & Win. */

import { el, qs } from "../utils/dom.js";
import { resolveAsset, SPIN_WHEEL } from "../config.js";

const COUNTDOWN_TICK_MS = 250;

function init() {
  const orderPanel = qs("#address-order");
  const form = qs("#address-form");
  const timer = qs("#address-countdown");
  if (!orderPanel || !form || !timer) return;

  let order;
  try {
    order = JSON.parse(sessionStorage.getItem("spin-win-order") || "null");
  } catch {
    order = null;
  }

  if (!order?.prize) {
    orderPanel.replaceChildren(
      el("p", { class: "card__text", text: "No prize found. Spin the wheel to win a prize first." }),
      el("a", { class: "btn btn--primary", href: "../index.html", text: "Back to Spin & Win" })
    );
    return;
  }

  const { prize } = order;
  orderPanel.replaceChildren(
    prize.img ? el("img", { class: "spin-win__win-image", src: resolveAsset(prize.img), alt: prize.label }) : null,
    el("h2", { class: "card__title", text: `Congratulations! ${prize.label}` }),
    el("p", { class: "card__text", text: prize.result })
  );
  form.hidden = false;

  const deadline = Date.now() + SPIN_WHEEL.countdownSeconds * 1000;
  let expired = false;

  function updateCountdown() {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    timer.textContent = remaining > 0
      ? `Hurry! Complete your address in ${minutes}:${String(seconds).padStart(2, "0")}`
      : "Address time expired. Spin again for another chance.";
    timer.classList.toggle("spin-win__countdown--urgent", remaining <= 30);
    if (remaining === 0) {
      expired = true;
      form.querySelector('button[type="submit"]').disabled = true;
      window.clearInterval(interval);
    }
  }

  updateCountdown();
  const interval = window.setInterval(updateCountdown, COUNTDOWN_TICK_MS);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (expired || !form.reportValidity()) return;

    const delivery = Object.fromEntries(new FormData(form).entries());
    sessionStorage.setItem("spin-win-order", JSON.stringify({ prize, delivery }));
    window.location.href = "./payment.html";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}