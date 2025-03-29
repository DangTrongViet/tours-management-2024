
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
                        if (item.quantity <= item.stock || item.quantity) {
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

// Cancel tour
function cancelItem(orderItemId) {
    const confirmDelete = confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?");
    if (!confirmDelete) return;

    fetch("/user/tourBookingHistory/cancelTour", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            orderItemId: orderItemId
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Response from server:", data.token);
            if (data.code == 200) {

                location.reload();
            }
        })
        .catch(error => {
            console.error("Lỗi khi gửi dữ liệu thông tin khách hàng:", error);
        });

}

// End Cancel tour
function displayVouchers(vouchers) {
    const voucherListContainer = document.getElementById('voucherList');
    voucherListContainer.innerHTML = '';

    if (vouchers.length > 0) {
        vouchers.forEach(voucher => {
            const discount = parseFloat(voucher.discount);
            const minAmount = parseFloat(voucher.minAmount);

            const card = document.createElement('div');
            card.classList.add('col-md-12', 'mb-3');

            card.innerHTML = `
                <div class="card">
                    <img src="/images/logoFoot.jpg" class="card-img-top" alt="Voucher Image">
                    <div class="card-body">
                        <h5 class="card-title">Giảm tối đa ${discount}%</h5>
                        <ul>
                            <li>Đơn tối thiểu: đ${minAmount.toLocaleString()} Tr</li>
                            <li>Hết hạn sau: ${voucher.daysLeft} ngày</li>
                        </ul>
                        <button class="btn btn-primary" onclick="addVoucher(${voucher.id}, ${discount}, ${minAmount})">Thêm</button>
                    </div>
                </div>
            `;

            voucherListContainer.appendChild(card);
        });

        voucherListContainer.style.display = 'block';
    } else {
        voucherListContainer.innerHTML = '<p>Không có voucher nào.</p>';
        voucherListContainer.style.display = 'block';
    }
}

let currentVoucher = null;  // Biến lưu voucher hiện tại (nếu có)

// Hàm thêm voucher
function addVoucher(voucherId, discount, minAmount) {
    const voucher = JSON.parse(localStorage.getItem("voucher"));

    if (voucher) {
        voucherId = voucher.voucherId;
        discount = parseFloat(voucher.discount);
        minAmount = parseFloat(voucher.minAmount)
    }
    currentVoucher = { voucherId, discount, minAmount };  // Lưu voucher vào biến hiện tại

    const selectedVoucherText = document.getElementById('selectedVoucherText');

    selectedVoucherText.textContent = `Giảm tối đa ${discount}% (Đơn tối thiểu: đ${minAmount.toLocaleString()} Tr)`;

    document.getElementById('voucherList').style.display = 'none';

    const voucherWrapper = document.createElement('div');
    voucherWrapper.classList.add(`voucher-${voucherId}`);
    const selectedVoucherContainer = selectedVoucherText.parentNode;
    voucherWrapper.appendChild(selectedVoucherText);
    selectedVoucherContainer.appendChild(voucherWrapper);

    // Tính lại tổng đơn hàng sau khi thêm voucher
    recalculateTotalPrice();
}

// Hàm tính toán tổng đơn hàng
function recalculateTotalPrice() {
    const orderItems = JSON.parse(document.querySelector("[data-orderItems]").getAttribute("data-orderItems"));
    let totalPrice = 0;

    const checkboxMulti = document.querySelector("[checkbox-multi]");
    const inputsId = checkboxMulti.querySelectorAll("input[name='id']");
    const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");

    // Tính tổng tiền các sản phẩm được chọn
    inputsId.forEach(cb => {
        if (cb.checked) {
            for (let item of orderItems) {
                if (item.id == cb.value) {
                    const priceNew = item.price_special;
                    const rowTotal = priceNew * item.quantity;
                    totalPrice += rowTotal;
                }
            }
        }
    });

    // Kiểm tra nếu tổng tiền đạt mức tối thiểu để áp dụng voucher (nếu có)
    if (currentVoucher && totalPrice >= currentVoucher.minAmount * 1000000) {
        totalPrice = totalPrice - (totalPrice * (currentVoucher.discount / 100));
    }

    const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;
    inputCheckAll.checked = countChecked === inputsId.length;

    // Cập nhật tổng tiền vào UI
    document.querySelector("#total-price").textContent = `Tổng đơn hàng: ${totalPrice.toLocaleString()}đ`;
}

// Xử lý sự kiện checkbox khi thay đổi
if (window.location.href.includes('user/payment')) {
    const orderItems = JSON.parse(document.querySelector("[data-orderItems]").getAttribute("data-orderItems"));

    const checkboxMulti = document.querySelector("[checkbox-multi]");
    if (checkboxMulti) {
        const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
        const inputsId = checkboxMulti.querySelectorAll("input[name='id']");

        // Sự kiện cho checkbox "Chọn tất cả"
        inputCheckAll.addEventListener("click", () => {
            let totalPrice = 0;

            inputsId.forEach(cb => {
                cb.checked = inputCheckAll.checked;

                if (cb.checked) {
                    for (let item of orderItems) {
                        if (item.id == cb.value) {
                            const priceNew = item.price_special;
                            const rowTotal = priceNew * item.quantity;
                            totalPrice += rowTotal;
                        }
                    }
                }
            });

            // Tính lại tổng tiền sau khi thay đổi checkbox
            recalculateTotalPrice();
        });

        // Sự kiện cho các checkbox từng món hàng
        inputsId.forEach(input => {
            input.addEventListener("click", () => {
                // Tính lại tổng tiền khi thay đổi checkbox
                recalculateTotalPrice();
            });
        });

        // Cập nhật lại tổng tiền khi hủy bỏ chọn checkbox
        inputsId.forEach(cb => {
            cb.addEventListener("change", () => {
                recalculateTotalPrice();
            });
        });
    }
}

// Sự kiện khi người dùng thay đổi voucher (thay đổi voucher sau khi đã chọn)
function changeVoucher(newVoucherId, newDiscount, newMinAmount) {
    currentVoucher = { voucherId: newVoucherId, discount: newDiscount, minAmount: newMinAmount };  // Cập nhật voucher mới
    addVoucher(newVoucherId, newDiscount, newMinAmount);  // Gọi lại hàm addVoucher để cập nhật tổng tiền
}

// Use voucher
function useVoucher(voucher) {
    const item = {
        voucherId: voucher.id,
        discount: voucher.discount,
        minAmount: voucher.minAmount
    };
    localStorage.setItem("voucher", JSON.stringify(item));

    window.location.href = '/user/payment';


    addVoucher(voucher.id, voucher.discount, voucher.minAmount);

}
// End Use voucher
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/user/payment') {
        const voucher = JSON.parse(localStorage.getItem("voucher"));

        if (voucher) {
            // Gọi lại hàm addVoucher để hiển thị voucher trên trang thanh toán
            addVoucher(voucher.voucherId, voucher.discount, voucher.minAmount);
            localStorage.removeItem("voucher");

        }
    }
});

function userPayment() {
    const selectedCheckboxes = document.querySelectorAll('input[name="id"]:checked');
    const selectedValues = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
    let voucherId = document.querySelector("#selectedVoucher").querySelector("div")
    if (voucherId) {
        voucherId = voucherId.getAttribute("class").match(/\d+/);
    }

    // Gửi yêu cầu POST đến backend
    fetch('/checkout/paymentSuccess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            orderItemsId: selectedValues,
            voucherId: voucherId || ""
        }),
    })
        .then(response => response.json())  // Nhận phản hồi từ backend
        .then(data => {
            const paymentData = {
                orderItems: data.orders,  // Dữ liệu đơn hàng
                voucher: data.voucher[0]     // Dữ liệu voucher
            };

            // Hiển thị giao diện với dữ liệu trả về
            renderPaymentSummary(paymentData);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
// Hàm để hiển thị giao diện với dữ liệu trả về
// Function to render the payment summary page
function renderPaymentSummary(paymentData) {
    const container = document.querySelector('.container.my-3');  // Find the container

    // Update page title and content
    container.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h2>Cảm ơn bạn đã thanh toán!</h2>
                <div class="payment-summary">
                    <h3>Thông tin thanh toán</h3>
                    ${generateOrderSummary(paymentData.orderItems, paymentData.voucher)}  <!-- Pass voucher here -->
                    ${generateVoucherSummary(paymentData.voucher)}
                    
                    <!-- Refund Policy Message -->
                    <div class="refund-policy">
                        <h4>Chính sách hoàn tiền</h4>
                        <p>Hủy trong vòng 3 ngày kể từ ngày thanh toán để được hoàn lại 70% số tiền. Sau 3 ngày, không hoàn tiền.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to generate the order summary table
function generateOrderSummary(orderItems, voucher) {
    if (!orderItems || orderItems.length === 0) {
        return '<p>Không có thông tin đơn hàng.</p>';
    }

    // Calculate the total order price
    let totalOrderPrice = orderItems.reduce((total, item) => {
        const itemTotal = item.price_special * item.quantity;
        return total + itemTotal;
    }, 0);

    // If there is a voucher, apply the discount
    if (voucher && voucher.discount) {
        totalOrderPrice = totalOrderPrice - (totalOrderPrice * (voucher.discount / 100));
    }

    const rows = orderItems.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.date}</td>
            <td><img src="${item.image}" alt="Image" width="80px"></td>
            <td><a href="/tours/detail/${item.slug}">${item.title}</a></td>
            <td>${item.price_special.toLocaleString()}đ</td>
            <td>${item.quantity}</td>
            <td>${(item.price_special * item.quantity).toLocaleString()}đ</td>
        </tr>
    `).join('');

    return `
        <div class="order-summary">
            <h4>Đơn hàng</h4>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Ngày thanh toán</th>
                        <th>Ảnh</th>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Tổng tiền</th>
                    </tr>
                </thead>
                <tbody id="paymentSuccess">
                    ${rows}
                </tbody>
            </table>
            <div class="total-order">
                <h5>Tổng đơn hàng: ${totalOrderPrice.toLocaleString()}đ</h5>
            </div>
        </div>
    `;
}

// Function to generate the voucher summary
function generateVoucherSummary(voucher) {
    if (!voucher) {
        return '<p>Không có voucher áp dụng.</p>';
    }

    return `
        <div class="voucher-summary">
            <h4>Voucher đã áp dụng</h4>
            <p>Giảm tối đa ${voucher.discount}% (Đơn tối thiểu: đ${voucher.minAmount.toLocaleString()} Tr)</p>
        </div>
    `;
}
function refundItem(itemId) {
    fetch('/checkout/refundMoneySuccess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            orderItemId: itemId
        }),
    })
        .then(response => response.json())
        .then(data => {

            renderRefundSuccess(data);

        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function renderRefundSuccess(data) {
    const container = document.querySelector('.container.my-3');  // The container where refund info will be displayed

    if (container) {  // Check if the container exists
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <!-- Refund Success Alert -->
                    <div class="alert alert-success">
                        <h3>Hoàn tiền thành công!</h3>
                        <p><strong>Tổng tiền hoàn lại (70%):</strong> ${data.totalPriceRefund}đ</p>
                        <p><strong>Ngày hoàn tiền:</strong> ${data.refundMoneyDate}</p>
                    </div>

                    <!-- Refund Details Table -->
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Ngày thanh toán</th>
                                <th>Ảnh</th>
                                <th>Tên</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>${data.refundMoneyDate}</td>
                                <td><img src="${JSON.parse(data.tour.images)[0]}" alt="${data.tour.title}" width="80px"></td>
                                <td>${data.tour.title}</td>
                                <td>${data.tour.price_special.toLocaleString()}đ</td>
                                <td>${data.tour.quantity}</td>
                                <td>${(data.tour.price_special * data.tour.quantity).toLocaleString()}đ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else {
        console.error("Refund info container not found on the page.");
    }
}




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
