/* spinWheel.js - "Spin & Win" promo wheel for the home hero banner
   UI-only, like the contact form: a spin lands on a random slice from
   SPIN_WHEEL (js/config.js), shows the result inline, and logs it. Nothing
   is sent anywhere and no coupon is issued.

   Geometry: each slice is drawn from its own angle and the pointer sits at
   12 o'clock (0deg). Rotating the wheel by R degrees moves a slice drawn at
   angle T to T + R, so the slice under the pointer is always the one
   covering (360 - R) mod 360. spin() solves that for the target slice rather
   than guessing, so the announced prize can never disagree with the label the
   pointer is resting on. */

import { SPIN_WHEEL, resolveAsset } from "../config.js";
import { el } from "../utils/dom.js";

/* Safety net for the completion callback: a backgrounded tab can finish the
   transition without firing `transitionend`, and a result must never hang. */
const RESULT_BUFFER_MS = 600;
const COUNTDOWN_TICK_MS = 250;

/**
 * Build one slice: a full-size square rotated about the wheel centre, so its
 * contents land in that slice's wedge. The prize's photo fills the wedge; a
 * prize with no artwork (the cash slice) fills it with its short label.
 */
function buildSlice(prize, index, sliceAngle) {
  const media = prize.img
    ? el("img", {
        class: "spin-wheel__img",
        src: resolveAsset(prize.img),
        alt: "",
        decoding: "async",
        loading: "lazy",
      })
    : el("span", { class: "spin-wheel__text", text: prize.label });

  return el(
    "span",
    {
      class: "spin-wheel__slice",
      "aria-hidden": "true", // the visually hidden prize list repeats the names
      // The colour only shows on an artwork-less slice, where the label is
      // drawn straight on the wedge.
      style: `--i: ${index}; --slice: ${sliceAngle}deg; color: ${prize.text};`,
    },
    media
  );
}

/** Build the wheel plate: one conic-gradient stop per prize. */
function buildWheel(prizes, sliceAngle) {
  const stops = prizes
    .map(
      (prize, i) =>
        `${prize.bg} ${i * sliceAngle}deg ${(i + 1) * sliceAngle}deg`
    )
    .join(", ");

  return el(
    "div",
    {
      class: "spin-win__wheel",
      "aria-hidden": "true",
      style: `background-image: conic-gradient(from 0deg, ${stops});`,
    },
    prizes.map((prize, index) => buildSlice(prize, index, sliceAngle))
  );
}

/** Create the "Spin & Win" widget (wheel + result line), wired up and done. */
export function createSpinWheel(config = SPIN_WHEEL) {
  const prizes = config.prizes;
  const sliceAngle = 360 / prizes.length;

  const wheel = buildWheel(prizes, sliceAngle);
  const previewWheel = buildWheel(prizes, sliceAngle);

  // role="status" announces each new result politely (no focus stealing). It is
  // a sibling of the widget rather than a child: components.css places the
  // wheel in the banner's third part and this line in the fourth.
  const result = el("p", { class: "spin-win__result", role: "status" });
  const overlayResult = el("p", {
    class: "spin-win__overlay-result",
    role: "status",
    "aria-live": "polite",
  });
  const countdown = el("p", {
    class: "spin-win__countdown",
    role: "timer",
    "aria-label": "Time remaining to spin",
    "aria-live": "off",
  });
  const previewCountdown = el("p", {
    class: "spin-win__countdown spin-win__countdown--preview",
    "aria-hidden": "true",
  });
  const winPanel = el("section", {
    class: "spin-win__win-panel",
    hidden: true,
  }, [
    el("img", { class: "spin-win__win-image", alt: "", decoding: "async" }),
    el("p", { class: "spin-win__win-message", "aria-live": "polite" }),
    el("button", {
      class: "btn btn--primary btn--block spin-win__delivery-button",
      type: "button",
      text: "Get it delivered to your doorstep",
    }),
  ]);
  const overlayHub = el("button", {
    class: "spin-win__hub spin-win__overlay-hub",
    type: "button",
    "aria-label": `${config.title}: spin the prize wheel`,
    text: "SPIN",
  });
  const overlayStage = el("div", { class: "spin-win__stage spin-win__overlay-stage" }, [
    el("span", { class: "spin-win__pointer", "aria-hidden": "true" }),
    wheel,
    overlayHub,
  ]);
  const paymentGate = el("section", {
    class: "spin-win__payment-gate card stack",
    "aria-label": "Spin payment",
    hidden: true,
  }, [
    el("h2", { class: "card__title", text: `Pay ₹${config.spinPriceRupees} to spin` }),
    el("p", { class: "card__text", text: `Tap SPIN to play — ₹${config.spinPriceRupees} per spin.` }),
    el("p", { class: "field__hint", text: `Demo flow: tapping pay opens the ₹${config.spinPriceRupees} UPI link (me.sho@ptyes) in a new tab, then the wheel unlocks here. Payment is not verified — complete it in the new tab.` }),
    el("button", {
      class: "btn btn--primary btn--block spin-win__payment-confirm",
      type: "button",
      text: `Pay ₹${config.spinPriceRupees} with UPI`,
    }),
    el("p", { class: "field__hint spin-win__payment-status", role: "status", "aria-live": "polite" }),
  ]);
  // First-load = big wheel visible. Payment gate only appears on SPIN intent.

  const stage = el("div", { class: "spin-win__stage spin-win__preview-stage" }, [
    el("span", { class: "spin-win__pointer", "aria-hidden": "true" }),
    previewWheel,
    el("button", {
      class: "spin-win__hub",
      type: "button",
      "aria-label": "Open full-screen Spin & Win wheel",
      text: "SPIN",
    }),
  ]);

  const widget = el("div", { class: "spin-win" }, [
    el("p", { class: "spin-win__title", text: config.title }),
    stage,
    previewCountdown,
    // The slices are rotated decorative boxes, so list the prizes properly for
    // assistive tech instead of leaving an unreadable wheel behind.
    el(
      "ul",
      { class: "sr-only" },
      prizes.map((prize) => el("li", { text: prize.result }))
    ),
  ]);

  const closeButton = el("button", {
    class: "spin-win__close",
    type: "button",
    "aria-label": "Close full-screen prize wheel",
    text: "×",
  });
  const overlay = el("div", {
    class: "spin-win__overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": config.title,
    hidden: true,
  }, [
    closeButton,
    el("div", { class: "spin-win__overlay-content" }, [
      el("p", { class: "spin-win__overlay-title", text: config.title }),
      paymentGate,
      overlayStage,
      countdown,
      overlayResult,
      winPanel,
      el("p", { class: "spin-win__overlay-hint", text: "Tap the wheel or SPIN to play" }),
    ]),
  ]);

  // config.js owns the timing, so the CSS duration is derived from it and the
  // two can never drift apart.
  widget.style.setProperty("--spin-duration", `${config.spinMs}ms`);
  overlay.style.setProperty("--spin-duration", `${config.spinMs}ms`);

  let rotation = 0; // cumulative degrees - only ever grows, so it never rewinds
  let spinning = false;
  let countdownInterval = null;
  let countdownDeadline = 0;
  let countdownStarted = false;
  let currentPrize = null;
  const deliveryButton = winPanel.querySelector(".spin-win__delivery-button");
  const paymentConfirm = paymentGate.querySelector(".spin-win__payment-confirm");
  const paymentStatus = paymentGate.querySelector(".spin-win__payment-status");
  let paymentConfirmed = false;

  function showPaymentGate(message) {
    if (message) paymentStatus.textContent = message;
    paymentGate.hidden = false;
    overlayStage.hidden = true;
    winPanel.hidden = true;
    paymentConfirm.focus();
  }

  function showWheel() {
    paymentGate.hidden = true;
    winPanel.hidden = true;
    overlayStage.hidden = false;
  }

  paymentConfirm.addEventListener("click", () => {
    // Demo flow: open the real ₹200 UPI link in a new tab, then unlock the
    // wheel locally. Payment is NOT verified — treat spins as unpaid demo
    // plays until a backend callback is wired up.
    if (config.paymentUrl) {
      window.open(config.paymentUrl, "_blank", "noopener");
      paymentStatus.textContent =
        `UPI link opened in a new tab — complete the ₹${config.spinPriceRupees} payment there, then spin below.`;
    }
    paymentConfirmed = true;
    showWheel();
    overlayHub.focus();
  });

  deliveryButton.addEventListener("click", () => {
    sessionStorage.setItem("spin-win-order", JSON.stringify({
      prize: { label: currentPrize.label, result: currentPrize.result, img: currentPrize.img },
    }));
    window.location.href = "./pages/address.html";
  });

  function updateCountdown() {
    const remaining = Math.max(0, Math.ceil((countdownDeadline - Date.now()) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const message = remaining > 0
      ? `Hurry! ${minutes}:${String(seconds).padStart(2, "0")} left to spin`
      : "Time's up! You can still spin the wheel.";
    const urgent = remaining <= 30;

    countdown.textContent = message;
    previewCountdown.textContent = remaining > 0
      ? `${minutes}:${String(seconds).padStart(2, "0")} left`
      : "Time's up";
    countdown.classList.toggle("spin-win__countdown--urgent", urgent);
    previewCountdown.classList.toggle("spin-win__countdown--urgent", urgent);

    if (remaining === 0 && countdownInterval !== null) {
      window.clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  function startCountdown() {
    if (countdownStarted) return;

    countdownStarted = true;
    countdownDeadline = Date.now() + config.countdownSeconds * 1000;
    updateCountdown();
    countdownInterval = window.setInterval(updateCountdown, COUNTDOWN_TICK_MS);
  }

  // Start with the home-page promo so the always-visible preview is counting
  // down even before the full-screen wheel is opened.
  startCountdown();

  function announce(prize) {
    spinning = false;
    currentPrize = prize;
    overlayHub.disabled = false;
    result.textContent = prize.result;
    overlayResult.textContent = prize.result;
    const winImage = winPanel.querySelector(".spin-win__win-image");
    winImage.hidden = !prize.img;
    if (prize.img) {
      winImage.src = resolveAsset(prize.img);
      winImage.alt = prize.label;
    }
    winPanel.querySelector(".spin-win__win-message").textContent =
      `Congratulations! You won ${prize.label}!`;
    winPanel.hidden = false;
    deliveryButton.hidden = false;
    // Keep the big wheel visible behind the win. Next SPIN tap will ask for
    // money again (paymentConfirmed reset below in spin()).
    paymentGate.hidden = true;
    overlayStage.hidden = false;

    // TODO: replace with a real claim request once a backend exists, e.g.
    // await fetch("/api/spin", { method: "POST" });
    console.log("Spin & Win result (UI-only):", prize.result);
  }

  function spin() {
    if (spinning) return;
    // Ask for money only on SPIN intent — first load stays a free big look.
    if (!paymentConfirmed) {
      showPaymentGate(`Pay ₹${config.spinPriceRupees} to spin and win.`);
      return;
    }
    spinning = true;
    paymentConfirmed = false;
    overlayHub.disabled = true;
    result.textContent = ""; // clear the old text so the new one re-announces
    overlayResult.textContent = "";
    winPanel.hidden = true;

    const index = Math.floor(Math.random() * prizes.length);
    const prize = prizes[index];
    // Aim at the middle of the winning slice, with a little jitter so the
    // wheel never stops dead center twice in a row.
    const jitter = (Math.random() - 0.5) * sliceAngle * 0.6;
    const target = index * sliceAngle + sliceAngle / 2 + jitter;

    const current = ((rotation % 360) + 360) % 360;
    const toGo = (((360 - target - current) % 360) + 360) % 360;
    rotation += config.turns * 360 + toGo;

    function settle() {
      window.clearTimeout(timer);
      wheel.removeEventListener("transitionend", onEnd);
      announce(prize);
    }

    function onEnd(event) {
      if (event.target !== wheel || event.propertyName !== "transform") return;
      settle();
    }

    wheel.addEventListener("transitionend", onEnd);
    // The timer is the fallback for a transition that never reports back, so a
    // result is guaranteed whether or not the event arrives.
    const timer = window.setTimeout(settle, config.spinMs + RESULT_BUFFER_MS);

    wheel.style.setProperty("--rotation", `${rotation}deg`);
  }

  function openOverlay() {
    overlay.hidden = false;
    startCountdown();
    // Always land on the big wheel first — payment only on SPIN tap.
    showWheel();
    paymentStatus.textContent = "";
    document.body.classList.add("spin-win-open");
    closeButton.focus();
  }

  function closeOverlay() {
    if (spinning) return;
    overlay.hidden = true;
    document.body.classList.remove("spin-win-open");
    launchButton.focus();
  }

  const launchButton = stage.querySelector("button");
  launchButton.addEventListener("click", openOverlay);
  stage.addEventListener("click", (event) => {
    if (event.target !== launchButton) openOverlay();
  });
  overlayHub.addEventListener("click", spin);
  overlayStage.addEventListener("click", (event) => {
    if (event.target !== overlayHub) spin();
  });
  closeButton.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeOverlay();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) closeOverlay();
  });

  // The wheel and the result line are two grid items (the third and fourth of
  // the banner's four parts), so they travel together: mount() drops the
  // fragment's children into the slot.
  const nodes = document.createDocumentFragment();
  nodes.append(widget, result, overlay);
  return nodes;
}