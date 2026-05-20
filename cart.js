document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "iphoneStoreCart";
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  const readCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
      return [];
    }
  };

  const saveCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartView();
  };

  const cleanPrice = (value) => Number(String(value).replace(/[^0-9.]/g, "")) || 0;

  const cartStyles = document.createElement("style");
  cartStyles.textContent = `
    .cart-button {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 1000;
      border: 0;
      border-radius: 999px;
      padding: 13px 18px;
      font-weight: 700;
      background: #111;
      color: #fff;
      box-shadow: 0 12px 30px rgba(0,0,0,.22);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cart-button span {
      min-width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      color: #111;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }

    .cart-cover {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.35);
      z-index: 1001;
      opacity: 0;
      pointer-events: none;
      transition: .25s ease;
    }

    .cart-cover.show {
      opacity: 1;
      pointer-events: auto;
    }

    .cart-panel {
      position: fixed;
      top: 0;
      right: -410px;
      width: min(390px, 92vw);
      height: 100vh;
      z-index: 1002;
      background: #fff;
      box-shadow: -16px 0 35px rgba(0,0,0,.18);
      transition: .3s ease;
      display: flex;
      flex-direction: column;
    }

    .cart-panel.show {
      right: 0;
    }

    .cart-head {
      padding: 22px;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cart-head h2 {
      margin: 0;
      font-size: 22px;
    }

    .cart-close {
      border: 0;
      background: #f2f2f2;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      cursor: pointer;
      font-size: 20px;
    }

    .cart-items {
      padding: 18px;
      overflow-y: auto;
      flex: 1;
    }

    .cart-empty {
      color: #666;
      text-align: center;
      margin-top: 70px;
      line-height: 1.6;
    }

    .cart-row {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid #eee;
    }

    .cart-row img {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 14px;
      background: #f7f7f7;
    }

    .cart-row h3 {
      margin: 0 0 5px;
      font-size: 15px;
    }

    .cart-row p {
      margin: 0 0 10px;
      font-weight: 700;
    }

    .cart-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cart-actions button {
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 8px;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-weight: 700;
    }

    .cart-actions .remove-item {
      width: auto;
      padding: 0 9px;
      color: #b00020;
      margin-left: auto;
    }

    .cart-bottom {
      padding: 18px 22px 24px;
      border-top: 1px solid #eee;
      background: #fafafa;
    }

    .cart-total {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 14px;
    }

    .checkout-btn,
    .clear-cart-btn {
      width: 100%;
      border: 0;
      border-radius: 14px;
      padding: 13px;
      cursor: pointer;
      font-weight: 700;
    }

    .checkout-btn {
      background: #111;
      color: #fff;
      margin-bottom: 10px;
    }

    .clear-cart-btn {
      background: #ececec;
      color: #111;
    }

    .added-toast {
      position: fixed;
      left: 50%;
      bottom: 95px;
      transform: translateX(-50%) translateY(20px);
      background: #111;
      color: #fff;
      padding: 12px 18px;
      border-radius: 999px;
      z-index: 1003;
      opacity: 0;
      transition: .25s ease;
      box-shadow: 0 10px 25px rgba(0,0,0,.2);
      font-size: 14px;
    }

    .added-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(cartStyles);

  const cartButton = document.createElement("button");
  cartButton.className = "cart-button";
  cartButton.innerHTML = `Cart <span class="cart-count">0</span>`;

  const cover = document.createElement("div");
  cover.className = "cart-cover";

  const panel = document.createElement("aside");
  panel.className = "cart-panel";
  panel.innerHTML = `
    <div class="cart-head">
      <h2>Your cart</h2>
      <button class="cart-close" aria-label="Close cart">&times;</button>
    </div>
    <div class="cart-items"></div>
    <div class="cart-bottom">
      <div class="cart-total">
        <span>Total</span>
        <strong class="cart-total-price">$0.00</strong>
      </div>
      <button class="checkout-btn">Checkout</button>
      <button class="clear-cart-btn">Clear cart</button>
    </div>
  `;

  const toast = document.createElement("div");
  toast.className = "added-toast";
  toast.textContent = "Added to cart";

  document.body.append(cartButton, cover, panel, toast);

  const openCart = () => {
    panel.classList.add("show");
    cover.classList.add("show");
  };

  const closeCart = () => {
    panel.classList.remove("show");
    cover.classList.remove("show");
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 1400);
  };

  const addItem = (product) => {
    const cart = readCart();
    const existingItem = cart.find((item) => item.name === product.name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    showToast(`${product.name} added to cart`);
  };

  const changeQuantity = (name, change) => {
    const cart = readCart()
      .map((item) => {
        if (item.name === name) {
          return { ...item, quantity: item.quantity + change };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCart(cart);
  };

  const removeItem = (name) => {
    const cart = readCart().filter((item) => item.name !== name);
    saveCart(cart);
  };

  const updateCartView = () => {
    const cart = readCart();
    const list = panel.querySelector(".cart-items");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartButton.querySelector(".cart-count").textContent = count;
    panel.querySelector(".cart-total-price").textContent = money.format(total);

    if (!cart.length) {
      list.innerHTML = `
        <div class="cart-empty">
          <strong>Your cart is empty.</strong><br>
          Add an iPhone and it will appear here.
        </div>
      `;
      return;
    }

    list.innerHTML = cart.map((item) => `
      <div class="cart-row">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${money.format(item.price)}</p>
          <div class="cart-actions">
            <button class="decrease-item" data-name="${item.name}">-</button>
            <span>${item.quantity}</span>
            <button class="increase-item" data-name="${item.name}">+</button>
            <button class="remove-item" data-name="${item.name}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  };

  document.querySelectorAll(".product").forEach((card) => {
    const button = card.querySelector("button");
    const name = card.querySelector("h3")?.textContent.trim();
    const price = cleanPrice(card.querySelector(".price")?.textContent);
    const image = card.querySelector("img")?.src || "";

    if (!button || !name || !price) return;

    button.type = "button";
    button.textContent = "Add to cart";

    button.addEventListener("click", () => {
      addItem({ name, price, image });
    });
  });

  cartButton.addEventListener("click", openCart);
  cover.addEventListener("click", closeCart);
  panel.querySelector(".cart-close").addEventListener("click", closeCart);

  panel.addEventListener("click", (event) => {
    const clicked = event.target;
    const itemName = clicked.dataset.name;

    if (clicked.classList.contains("increase-item")) {
      changeQuantity(itemName, 1);
    }

    if (clicked.classList.contains("decrease-item")) {
      changeQuantity(itemName, -1);
    }

    if (clicked.classList.contains("remove-item")) {
      removeItem(itemName);
    }

    if (clicked.classList.contains("clear-cart-btn")) {
      saveCart([]);
    }

    if (clicked.classList.contains("checkout-btn")) {
      const cart = readCart();

      if (!cart.length) {
        showToast("Your cart is still empty");
        return;
      }

      showToast("Order ready for checkout");
      openCart();
    }
  });

  updateCartView();
});
