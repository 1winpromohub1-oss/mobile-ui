/* pages/home.js - page-specific behavior for the home page
   The "Spin & Win" wheel belongs to the home hero banner only, so it is
   mounted here rather than in the shared shell (js/main.js), the same way
   js/pages/contact.js owns the contact form. */

import { qs, mount } from "../utils/dom.js";
import { createSpinWheel } from "../components/spinWheel.js";

function init() {
  const slot = qs("#hero-spin");
  if (slot) mount(slot, createSpinWheel());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}