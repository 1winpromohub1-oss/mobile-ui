/* icons.js — small dependency-free SVG icons for shared navigation chrome. */

import { el } from "./dom.js";

const ICON_PATHS = {
  home: [
    ["path", { d: "m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }],
    ["path", { d: "M9 22V12h6v10" }],
  ],
  about: [
    ["circle", { cx: "12", cy: "12", r: "9" }],
    ["line", { x1: "12", y1: "11", x2: "12", y2: "16" }],
    ["line", { x1: "12", y1: "8", x2: "12.01", y2: "8" }],
  ],
  contact: [
    ["rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }],
    ["path", { d: "m3 7 9 6 9-6" }],
  ],
  profile: [
    ["circle", { cx: "12", cy: "8", r: "3" }],
    ["path", { d: "M5 20a7 7 0 0 1 14 0" }],
  ],
  cart: [
    ["path", { d: "M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" }],
    ["circle", { cx: "10", cy: "20", r: "1" }],
    ["circle", { cx: "18", cy: "20", r: "1" }],
  ],
};

/** Create a consistently sized, current-color SVG icon. */
export function createIcon(name, className) {
  const svg = el("svg", {
    class: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    focusable: "false",
  });

  for (const [tag, attrs] of ICON_PATHS[name] || []) {
    svg.append(el(tag, attrs));
  }

  return svg;
}