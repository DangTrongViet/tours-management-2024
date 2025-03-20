
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
                    quantity: quantity,
                    checked: false
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
    showMiniCart();
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
                        if (item.quantity <= item.stock) {
                            const rowTotal = priceNew * item.quantity;

                            const image = JSON.parse(item.images);
                            const imageUrl = image[0];


                            cartItemsHtml += `
                                <tr>
                                    <td>
                                        <input type="checkbox" name="id" value =${item.id}>
                                    </td>
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
                        }

                    });

                    document.querySelector("#cartItems").innerHTML = cartItemsHtml;
                    updateCart();
                    // Checkbox Multi
                    const checkboxMulti = document.querySelector("[checkbox-multi]");
                    if (checkboxMulti) {
                        const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
                        const inputsId = checkboxMulti.querySelectorAll("input[name='id']");
                        inputCheckAll.addEventListener("click", () => {
                            totalPrice = 0;

                            inputsId.forEach(item => {
                                item.checked = inputCheckAll.checked;

                                if (item.checked) {

                                    const itemData = cartItems.find(i => i.id == parseInt(item.value));
                                    const priceNew = (itemData.price * (1 - (itemData.discount) / 100));
                                    const rowTotal = priceNew * itemData.quantity;
                                    totalPrice += rowTotal;
                                    c = cart.map(i => {
                                        i.checked = true; // thêm key checked vào mỗi item
                                        return i;
                                    });

                                }
                                else {

                                    c = cart.map(i => {
                                        i.checked = false; // thêm key checked vào mỗi item
                                        return i;
                                    });
                                }
                                localStorage.setItem('cart', JSON.stringify(c));

                            });
                            document.querySelector("[total-price]").textContent = totalPrice.toLocaleString();
                        });

                        inputsId.forEach(input => {
                            input.addEventListener("click", () => {
                                totalPrice = 0; // Reset tổng tiền khi thay đổi lựa chọn checkbox
                                inputsId.forEach(cb => {
                                    if (cb.checked) {
                                        const itemData = cartItems.find(i => i.id == parseInt(cb.value));
                                        const indexItem = cart.findIndex(i => i.tourId == parseInt(cb.value));
                                        cart[indexItem].checked = true;
                                        localStorage.setItem("cart", JSON.stringify(cart));


                                        const priceNew = (itemData.price * (1 - (itemData.discount) / 100));
                                        const rowTotal = priceNew * itemData.quantity;
                                        totalPrice += rowTotal;
                                    }
                                    else {
                                        const indexItem = cart.findIndex(i => i.tourId == parseInt(cb.value));
                                        cart[indexItem].checked = false;
                                        localStorage.setItem("cart", JSON.stringify(cart));
                                    }
                                });
                                // Cập nhật tổng tiền
                                document.querySelector("[total-price]").textContent = totalPrice.toLocaleString();
                                // Cập nhật trạng thái "Chọn tất cả" nếu tất cả các checkbox được chọn
                                const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;
                                inputCheckAll.checked = countChecked === inputsId.length;

                            });
                        });
                    }
                    // End Checkbox Multi
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
                    if (indexExistCart !== -1) {

                        cart[indexExistCart].quantity = quantity;

                        localStorage.setItem("cart", JSON.stringify(cart));
                        cartDetail();
                    }

                }
            });
        })
    }
}
// End Update Cart

// Pagination
const buttonPagination = document.querySelectorAll("[button-pagination]");
buttonPagination.forEach(item => {
    item.addEventListener("click", () => {
        const page = item.getAttribute("button-pagination");
        if (page) {
            const paginationUrl = new URL(window.location.href);
            paginationUrl.searchParams.set("page", page);
            location.href = paginationUrl.href;
        }
    });
});
// End Pagination

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
                c = cart.filter(item => item.checked !== true);
                localStorage.setItem('cart', JSON.stringify(c));
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

// Search
const formSearch = document.querySelector("[form-search]");
if (formSearch) {
    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();

        const keyword = document.querySelector("input[name='keyword']").value;

        window.location.href = `/search?keyword=${encodeURIComponent(keyword)}`;
    });
}

// End Search

