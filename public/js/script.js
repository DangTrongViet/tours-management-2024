
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

// Show Alert

const showAlert = document.querySelector("[show-alert]");
if (showAlert) {

    const time = parseInt(showAlert.getAttribute("data-time"));
    const closeAlert = showAlert.querySelector("[close-alert]");
    setTimeout(() => {
        showAlert.classList.add("alert-hidden");
    }, time);
    closeAlert.addEventListener("click", () => {
        showAlert.classList.add("alert-hidden");
    });
}
// End Show Alert
// Carts
// Nếu chưa có cart thì khởi tạo
const cart = JSON.parse(localStorage.getItem("cart"));
if (!cart) {
    const cart = [];
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

            const indexExistCart = cart.findIndex(item => item.tourId == tourId);
            if (indexExistCart === -1) {

                cart.push({
                    tourId: tourId,
                    quantity: quantity
                });
            } else {

                cart[indexExistCart].quantity += quantity;
            }

            localStorage.setItem("cart", JSON.stringify(cart));


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
    if (cart.length > 0) {

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
                const cartItems = data.data.cart["detailCart"];

                if (cartItems.length > 0) {
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
                                    <a href="/tours/detail/${item.slug}">${item.title}
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
                }

            })
            .catch(error => {
                console.error("Lỗi khi gửi dữ liệu giỏ hàng:", error);
            });
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
function updateCart() {
    const inputQuantity = document.querySelectorAll('input[name="quantity"]')
    if (inputQuantity.length > 0) {
        inputQuantity.forEach((input) => {
            input.addEventListener("change", (e) => {
                if (e.target.name === 'quantity') {
                    const quantity = parseInt(e.target.value);
                    const itemId = e.target.getAttribute("item-id");

                    const indexExistCart = cart.findIndex(item => item.tourId == itemId);
                    console.log(indexExistCart);
                    if (indexExistCart !== -1) {

                        cart[indexExistCart].quantity = quantity;
                        console.log("hi")
                        localStorage.setItem("cart", JSON.stringify(cart));
                        cartDetail();
                    }

                }
            });
        })
    }
}
// End Update Cart

// Lấy thông tin khách hàng đặt hàng
const formOrder = document.querySelector("[form-order]");
if (formOrder) {
    formOrder.addEventListener("submit", (e) => {
        e.preventDefault();
        const fullName = formOrder.querySelector("[name='fullName']").value;
        const email = formOrder.querySelector("[name='email']").value;
        const phone = formOrder.querySelector("[name='phone']").value;
        const note = formOrder.querySelector("[name='note']").value;

        const cart = JSON.parse(localStorage.getItem("cart"));

        fetch("/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cart,
                customer: {
                    fullName: fullName,
                    email: email,
                    phone: phone,
                    note: note
                }
            })
        })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem("cart", JSON.stringify([]));
                const orderId = data.data.order["orderId"]
                location.href = `/checkout/success/${orderId}`;
                console.log("Response from server:", data.data.customer);
            })
            .catch(error => {
                console.error("Lỗi khi gửi dữ liệu giỏ hàng và thông tin khách hàng:", error);
            });

    });
}
//  End Lấy thông tin khách hàng đặt hàng


// Đăng ký
const formRegister = document.querySelector("[form-register]");
if (formRegister) {
    formRegister.addEventListener("submit", (e) => {

        e.preventDefault();
        const fullName = formRegister.querySelector("input[name='fullName']").value;
        const email = formRegister.querySelector("input[name='email']").value;
        const phone = formRegister.querySelector("input[name='phone']").value;
        const password = formRegister.querySelector("input[name='password']").value;
        const token = getCookie("tokenUser");

        fetch("/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({

                fullName: fullName,
                email: email,
                phone: phone,
                password: password

            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response from server:", data.token);
                if (data.code == 200) {
                    setTimeout(() => {
                        if (data.redirectTo) {
                            location.href = data.redirectTo;

                        }
                    }, 3000);

                }
            })
            .catch(error => {
                console.error("Lỗi khi gửi dữ liệu thông tin khách hàng:", error);
            });

    });

}
// End Đăng ký

// getCookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// end getCookie

// Đăng nhập
const formLogin = document.querySelector("[form-login]");
if (formLogin) {
    formLogin.addEventListener("submit", e => {
        e.preventDefault();
        const email = document.querySelector("input[name='email']").value;
        const password = document.querySelector("input[name='password']").value;

        fetch("/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    location.href = data.redirectTo;

                }
            })
            .catch(error => {
                console.error("Lỗi khi gửi dữ liệu thông tin khách hàng:", error);
            });

    });
}
// End Đăng nhập


// Quên mật khẩu
const formForgotPasword = document.querySelector("[form-forgotPassword]");
if (formForgotPasword) {
    formForgotPasword.addEventListener("submit", e => {
        e.preventDefault();

        const email = document.querySelector("input[name='email']").value;

        fetch("/user/password/forgot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

            },
            body: JSON.stringify({
                email: email
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response from server:", data.token);
                console.log(data);
                if (data.code === 200) {
                    location.href = '/user/password/otp'
                }
            })
            .catch(error => {
                console.error("Lỗi khi gửi dữ liệu thông tin khách hàng:", error);
            });

    });
}
// End Quên mật khẩu

// Nhập Otp 
const formOtpPasword = document.querySelector("[form-otp]");
if (formOtpPasword) {
    formOtpPasword.addEventListener("submit", e => {

        const email = document.querySelector("input[name='email']").value;
        const otp = document.querySelector("input[name='otp']").value;
        fetch("/user/password/otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

            },
            body: JSON.stringify({
                email: email,
                otp: otp
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response from server:", data.token);

                if (data.code === 200) {
                    localStorage.setItem("email", email);
                    location.href = '/user/password/reset'
                }
            })
            .catch(error => {
                console.error("Lỗi khi gửi dữ liệu thông tin khách hàng:", error);
            });

    });
}
// End Nhập Otp 

// Nhập Otp 
const formResetPasword = document.querySelector("[form-resetPassword]");
if (formResetPasword) {
    formResetPasword.addEventListener("submit", e => {

        const password = document.querySelector("input[name='password']").value;
        const confirmPassword = document.querySelector("input[name='confirmPassword']").value;
        const email = localStorage.getItem("email");
        fetch("/user/password/reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

            },
            body: JSON.stringify({
                email: email,
                password: password,
                confirmPassword: confirmPassword
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response from server:", data.token);

                if (data.code === 200) {

                    location.href = '/user/login'
                }
            })
            .catch(error => {
                console.error("Lỗi khi gửi dữ liệu thông tin khách hàng:", error);
            });

    });
}
// End Nhập Otp 

