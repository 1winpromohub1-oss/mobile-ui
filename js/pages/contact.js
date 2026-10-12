/* pages/contact.js — page-specific behavior for contact.html
   UI-only: prevents a real submit (no backend yet) and shows
   a simple inline confirmation instead. Replace the TODO with
   a fetch() call once a backend/API exists. */

import { qs, el } from "../utils/dom.js";

function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());

  // TODO: replace with a real request once a backend is available, e.g.:
  // await fetch("/api/contact", { method: "POST", body: JSON.stringify(data) });
  console.log("Contact form submitted (UI-only):", data);

  showConfirmation(form);
}

function showConfirmation(form) {
  let confirmation = qs("#contact-confirmation");
  if (!confirmation) {
    confirmation = el("p", {
      id: "contact-confirmation",
      class: "field__hint",
      role: "status",
    });
    form.append(confirmation);
  }
  confirmation.textContent = "Thanks! This is a UI-only demo — nothing was sent.";
  form.reset();
}

function init() {
  const form = qs("#contact-form");
  if (form) form.addEventListener("submit", handleSubmit);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
