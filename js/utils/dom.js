/* dom.js — minimal DOM helpers
   Keeps component code short and readable without a framework. */

/** querySelector shorthand */
export const qs = (selector, scope = document) => scope.querySelector(selector);

/** querySelectorAll shorthand, returned as a real Array */
export const qsa = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/**
 * Create an element.
 * @param {string} tag - tag name
 * @param {Object} [attrs] - attributes/props (class, id, href, text, html, dataset, on*)
 * @param {Array<Node|string>} [children] - child nodes or text
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;

    if (key === "class") {
      node.className = value;
    } else if (key === "text") {
      node.textContent = value;
    } else if (key === "html") {
      node.innerHTML = value;
    } else if (key === "dataset") {
      Object.assign(node.dataset, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value);
    }
  }

  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }

  return node;
}

/** Add one or more event listeners; returns a cleanup function. */
export function on(target, events, handler, options) {
  const list = [].concat(events);
  list.forEach((evt) => target.addEventListener(evt, handler, options));
  return () =>
    list.forEach((evt) => target.removeEventListener(evt, handler, options));
}

/** Mount a node into a container (replacing existing content). */
export function mount(container, node) {
  if (!container) return;
  container.replaceChildren(node);
}

/** Read a data attribute from <html> or fall back to a default. */
export function getRootData(key, fallback = null) {
  return document.documentElement.dataset[key] ?? fallback;
}