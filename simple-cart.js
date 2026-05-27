let cart = [];
let cartList = document.getElementById("cart-list");
let cartTotal = document.getElementById("cart-total");
let buttons = document.querySelectorAll(".product button");

buttons.forEach(function(button) {
  button.addEventListener("click", function() {
    let product = button.closest(".product");
    let name = product.querySelector("h3").innerText;
    let priceText = product.querySelector(".price").innerText;
    let price = Number(priceText.replace(/[^0-9.]/g, ""));

    cart.push({
      name: name,
      price: price
    });

    showCart();
  });
});

function showCart() {
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach(function(item) {
    let listItem = document.createElement("li");
    listItem.innerText = item.name + " - P" + item.price;
    cartList.appendChild(listItem);

    total = total + item.price;
  });

  cartTotal.innerText = "Total: P" + total;
}
