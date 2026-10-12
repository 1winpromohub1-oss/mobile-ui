/* footer.js — content footer (sits above the bottom nav on mobile). */

import { APP } from "../config.js";
import { el } from "../utils/dom.js";

/** Create the footer element. */
export function createFooter() {
  return el("footer", { class: "app-footer" }, [
    el("p", {
      text: `© ${APP.year} ${APP.name}. Built as a mobile-first UI base.`,
    }),
  ]);
}