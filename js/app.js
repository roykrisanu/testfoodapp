const menuGrid = document.getElementById("menu-grid");
const template = document.getElementById("menu-card-template");
const cuisineFilter = document.getElementById("cuisine-filter");
const searchInput = document.getElementById("search-input");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout-btn");
const viewCartBtn = document.getElementById("view-cart-btn");
const cartPanel = document.getElementById("cart-panel");

const DELIVERY_FEE = 3.99;
const cart = new Map();
let menuData = [];

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function renderMenu(items) {
  menuGrid.innerHTML = "";

  if (!items.length) {
    menuGrid.innerHTML = `<p>No dishes found. Try another keyword or cuisine.</p>`;
    return;
  }

  items.forEach((item) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".item-image").src = item.image;
    node.querySelector(".item-image").alt = item.name;
    node.querySelector(".restaurant").textContent = item.restaurant;
    node.querySelector(".delivery-time").textContent = item.deliveryTime;
    node.querySelector(".item-name").textContent = item.name;
    node.querySelector(".item-description").textContent = item.description;
    node.querySelector(".price").textContent = formatPrice(item.price);
    node.querySelector(".add-btn").addEventListener("click", () => addToCart(item));
    menuGrid.appendChild(node);
  });
}

function populateCuisineFilter(items) {
  const cuisines = [...new Set(items.map((item) => item.cuisine))];
  cuisines.forEach((cuisine) => {
    const option = document.createElement("option");
    option.value = cuisine;
    option.textContent = cuisine;
    cuisineFilter.appendChild(option);
  });
}

function getFilteredItems() {
  const selectedCuisine = cuisineFilter.value;
  const query = searchInput.value.trim().toLowerCase();

  return menuData.filter((item) => {
    const cuisineMatch = selectedCuisine === "all" || item.cuisine === selectedCuisine;
    const queryMatch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.restaurant.toLowerCase().includes(query);
    return cuisineMatch && queryMatch;
  });
}

function updateCartView() {
  cartItems.innerHTML = "";
  let subtotal = 0;
  let count = 0;

  cart.forEach(({ item, quantity }) => {
    subtotal += item.price * quantity;
    count += quantity;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name} × ${quantity}</span>
      <span>${formatPrice(item.price * quantity)}</span>
    `;
    cartItems.appendChild(li);
  });

  if (count === 0) {
    cartItems.innerHTML = "<li>Your cart is empty. Add a local favorite!</li>";
  }

  cartCount.textContent = String(count);
  subtotalEl.textContent = formatPrice(subtotal);
  totalEl.textContent = formatPrice(subtotal + DELIVERY_FEE);
}

function addToCart(item) {
  const current = cart.get(item.id);
  if (current) {
    current.quantity += 1;
  } else {
    cart.set(item.id, { item, quantity: 1 });
  }
  updateCartView();
}

function bindControls() {
  [cuisineFilter, searchInput].forEach((el) => {
    el.addEventListener("input", () => renderMenu(getFilteredItems()));
  });

  checkoutBtn.addEventListener("click", () => {
    if (!cart.size) {
      alert("Your cart is empty. Add a meal to continue.");
      return;
    }
    alert("Order placed! Your local meal is being prepared.");
    cart.clear();
    updateCartView();
  });

  viewCartBtn.addEventListener("click", () => {
    cartPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function init() {
  const response = await fetch("data/menu.json");
  menuData = await response.json();
  populateCuisineFilter(menuData);
  renderMenu(menuData);
  updateCartView();
  bindControls();
}

init();
