let total = 0;

let cartList = document.getElementById("cart-items");
let cartTotal = document.getElementById("cart-total");
let emptyCart = document.getElementById("empty-cart");

let buttons = document.querySelectorAll(".product button");

buttons.forEach(function(button) {
  button.addEventListener("click", function() {
    let productInfo = button.parentElement;
    let name = productInfo.querySelector("h3").innerText;
    let priceText = productInfo.querySelector(".price").innerText;
    let price = Number(priceText.replace("$", ""));

    let item = document.createElement("li");
    item.innerText = name + " - $" + price;
    cartList.appendChild(item);

    total = total + price;
    cartTotal.innerText = "Total: $" + total;

    emptyCart.style.display = "none";

    alert(name + " has been added to your cart.");
  });
});
