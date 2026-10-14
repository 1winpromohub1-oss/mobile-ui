/* products.js — selected-product and demo-cart state for the product flow. */

const SELECTED_PRODUCT_KEY = "selected-product";
const CART_KEY = "demo-cart";

function readJson(storage, key, fallback) {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Store the product that the shopper selected on the home grid. */
export function saveSelectedProduct(product) {
  return writeJson(sessionStorage, SELECTED_PRODUCT_KEY, product);
}

/** Read the product selected before opening the details page. */
export function getSelectedProduct() {
  const product = readJson(sessionStorage, SELECTED_PRODUCT_KEY, null);
  return product && product.id ? product : null;
}

/** Read the local demo cart without allowing malformed data to break the UI. */
export function getCart() {
  const cart = readJson(localStorage, CART_KEY, []);
  return Array.isArray(cart)
    ? cart.filter((item) => item && item.id && Number(item.quantity) > 0)
    : [];
}

/** Add one product to the local demo cart and return the updated count. */
export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  writeJson(localStorage, CART_KEY, cart);
  return {
    cart,
    itemCount: cart.reduce((total, item) => total + item.quantity, 0),
  };
}

/** Remove all units of one product from the local demo cart. */
export function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  writeJson(localStorage, CART_KEY, cart);
  return cart;
}

/** Format the demo prices consistently across cards, details, and cart. */
export function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}