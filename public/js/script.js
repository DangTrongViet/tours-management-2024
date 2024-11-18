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

// Hiển thị thông báo xóa sản phẩm khỏi giỏ hàng
const alertDeleteCartSuccess = () => {
    const elementAlert = document.querySelector("[alert-delete-cart-success]");
    console.log(elementAlert);
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
const cart = JSON.parse(localStorage.getItem("cart"));
if (!cart) {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
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


// Lấy ra thông tin cart

const cartDetail = () => {
    if (cart) {

        fetch("/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ cart })
        })
            .then(response => response.json())
            .then(data => {
                let cartItemsHtml = '';
                let totalPrice = 0;
                const cartItems = data.data;

                cartItems.forEach((item, index) => {
                    const priceNew = (item.price * (1 - (item.discount) / 100))
                    const rowTotal = priceNew * item.quantity;
                    totalPrice += rowTotal;
                    const image = JSON.parse(item.images);
                    const imageUrl = image[0];


                    cartItemsHtml += `
                        <tr>
                            <td>
                                ${index + 1}
                            </td>
                            <td>
                                <img src="${imageUrl}" alt="${item.title}" style="width: 50px; height: 50px;">
                            </td>
                            <td>
                                <a href="/tours/detail/${item.id}">${item.title}
                                </a>
                            </td>
                            <td>
                                ${priceNew.toLocaleString()}đ
                            </td>
                            <td>
                                <input type="number" name="quantity" value="${item.quantity}" min="1" max="${item.stock}" item-id="${item.id}" style="width: 60px;">
                            </td>
                            <td>
                                ${rowTotal.toLocaleString()}đ
                            </td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">Xoá</button>
                            </td>

                        </tr>
                    `;

                });
                document.querySelector("tbody").innerHTML = cartItemsHtml;
                document.querySelector("[total-price]").textContent = totalPrice.toLocaleString();
                updateCart();
            })
            .catch(error => {
                console.error("Lỗi khi gửi dữ liệu giỏ hàng:", error);
            });
    } else {
        console.log("Giỏ hàng trống hoặc không tồn tại");
    }
}

cartDetail();
// End Lấy ra thông tin cart

// Delete Item in Cart
function deleteItem(itemId) {

    const index = cart.findIndex(item => item.tourId === itemId);
    if (index !== -1) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        cartDetail();
        alertDeleteCartSuccess();
    }
}

// End Delete Item in Cart

// Update Cart

function updateCart(){
    const inputQuantity = document.querySelectorAll('input[name="quantity"]')
    if (inputQuantity.length > 0) {
        inputQuantity.forEach((input) => {
            input.addEventListener("change", (e) => {
                
                const quantity = parseInt(e.target.value);
                const itemId = e.target.getAttribute("item-id");

                const indexExistCart = cart.findIndex(item => item.tourId == itemId);
                if (indexExistCart !== -1) {

                    cart[indexExistCart].quantity = quantity;

                    localStorage.setItem("cart", JSON.stringify(cart));
                    cartDetail();
                }
            });
        })
    }
}

// End Update Cart

