// Slide Tour Detail
var imagesThumb = new Swiper(".imagesThumb", {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
});

var imagesMain = new Swiper(".imagesMain", {
    spaceBetween: 10,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    thumbs: {
        swiper: imagesThumb,
    },
});
// End Slide Tour Detail

// Hiển thị thông báo thêm vào giỏ hàng
const alertAddCartSuccess = () => {
    const elementAlert = document.querySelector("[alert-add-cart-success]");
    if (elementAlert) {
        elementAlert.classList.remove("alert-hidden");

        setTimeout(() => {
            elementAlert.classList.add("alert-hidden");
        }, 3000);

        const closeAlert = elementAlert.querySelector("[close-alert]");
        closeAlert.addEventListener("click", () => {
            elementAlert.classList.add("alert-hidden");
        });
    }
}

// Carts
// Nếu chưa có cart thì khởi tạo
const cart = localStorage.getItem("cart");
if (!cart) {
    localStorage.setItem("cart", JSON.stringify([]));
}

// Hiển thị tổng số lượng sản phẩm trong giỏ hàng
const showMiniCart = () => {
    const miniCart = document.querySelector("[mini-cart]");
    if (miniCart) {
        const cart = JSON.parse(localStorage.getItem("cart"));
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        miniCart.innerHTML = totalQuantity;
    }
}

// Hiển thị giỏ hàng sau khi tải trang
showMiniCart();

// Thêm tour vào giỏ hàng
const formAddToCart = document.querySelector("[form-add-to-cart]");

if (formAddToCart) {
    formAddToCart.addEventListener("submit", (e) => {
        e.preventDefault();
        const quantity = parseInt(e.target.elements.quantity.value);
        const tourId = parseInt(formAddToCart.getAttribute("tour-id"));

        if (quantity > 0 && !isNaN(tourId)) {
            const cart = JSON.parse(localStorage.getItem("cart"));

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const indexExistCart = cart.findIndex(item => item.tourId == tourId);
            if (indexExistCart === -1) {
                // Thêm mới nếu chưa có
                cart.push({
                    tourId: tourId,
                    quantity: quantity
                });
            } else {
                // Cập nhật số lượng nếu đã có
                cart[indexExistCart].quantity += quantity;
            }

            // Lưu giỏ hàng vào localStorage
            localStorage.setItem("cart", JSON.stringify(cart));

            // Hiển thị thông báo và cập nhật giỏ hàng
            alertAddCartSuccess();
            showMiniCart();
        } else {
            console.log("Lỗi: Số lượng hoặc tourId không hợp lệ");
        }
    });
}
// End Carts
