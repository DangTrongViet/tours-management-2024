import express, { Request, Response } from "express";
import Customer from "../../models/customer.model";
import ForgotPassword from "../../models/forgot_password.model";
import md5 from "md5";
import { generateRandomNumber, generateRandomString } from "../../helpers/generate";
import sendMailHelper from "../../helpers/sendEmail";
import sequelize from "../../config/database";
import { Op, QueryTypes } from "sequelize";
import Voucher from "../../models/voucher.model";
import Tour from "../../models/tour.model";
import orderItem from "../../models/orders_item.model";
import { raw } from "mysql2";
import { months } from "moment";
// [GET] /user/register
export const index = async (req: Request, res: Response) => {

    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký tài khỏan",
        messages: {
            error: req.flash("error"),
            success: req.flash("success")
        }
    });

};

// [POST] /user/register
export const register = async (req: Request, res: Response) => {
    interface User {
        fullName: string,
        email: string,
        phone: string,
        password: string,
        token: string
    };

    let userInfo: User = {
        fullName: "",
        email: "",
        phone: "",
        password: "",
        token: ""
    };

    if (req.body.fullName) {
        userInfo.fullName = req.body.fullName;
    };

    if (req.body.email) {
        userInfo.email = req.body.email;
    };

    if (req.body.phone) {
        userInfo.phone = req.body.phone;
    };

    if (req.body.password) {
        userInfo.password = md5(req.body.password);
    };

    const existEmail = await Customer.findOne({
        raw: true,
        where: {
            phone: userInfo.email,
            deleted: false,
            status: "active"
        }
    });

    if (existEmail) {
        req.flash("error", "Email đã tồn tại!");

        res.json({
            code: 400,
            message: "Email đã tồn tại!"
        });

        return;

    }
    userInfo.token = generateRandomString(21);

    await Customer.create({
        fullName: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.phone,
        password: userInfo.password,
        token: userInfo.token,
    });

    req.flash("success", "Đăng ký tài khoản thành công!");

    res.cookie("tokenUser", userInfo.token);


    res.json({
        code: 200,
        token: userInfo.token,
        message: "Đăng ký tài khoản thành công!",
        redirectTo: "/"
    });



};


// [GET] /user/login
export const login = async (req: Request, res: Response) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập tài khỏan",
        messages: {
            error: req.flash("error"),
            success: req.flash("success")
        }
    });

};

// [POST] /user/login
export const loginPost = async (req: Request, res: Response) => {
    interface User {
        email: string,
        password: string,
        token: string
    }
    const user: User = {
        email: "",
        password: "",
        token: ""
    };

    if (req.body.email) {
        user.email = req.body.email;
    }
    if (req.body.password) {
        user.password = req.body.password;
    }

    const existUser = await Customer.findOne({
        raw: true,
        where: {
            email: user.email,
            deleted: false,
            status: "active"
        }
    });

    if (!existUser) {

        req.flash("error", "Tài khoản không tồn tại!");

        res.json({
            code: 400,
            message: "Tài khoản không tồn tại!"
        });
        return;

    }

    if (existUser["password"] !== md5(user.password)) {



        req.flash("error", "Mật khẩu không đúng!");

        res.json({
            code: 400,
            message: "Mật khẩu không đúng!"
        });
        return;

    }

    req.flash("success", "Đăng nhập thành công");

    res.cookie("tokenUser", existUser["token"]);

    res.json({
        code: 200,
        message: "Đăng nhập thành công",
        token: existUser["token"],
        redirectTo: "/"
    });



};

// [GET] /user/forgotPassword
export const forgotPassword = async (req: Request, res: Response) => {

    res.render("client/pages/user/forgot-password", {
        pageTitle: "Quên mật khẩu",
        messages: {
            error: req.flash("error"),
            success: req.flash("success")
        }
    });

};

// [POST] /user/forgotPassword
export const forgotPasswordPost = async (req: Request, res: Response) => {
    const email = req.body.email;

    const user = await Customer.findOne({
        raw: true,
        where: {
            email: email,
            deleted: false,
            status: "active"
        }
    });

    if (!user) {
        req.flash("error", "Email không tồn tại!");
        res.json({
            code: 400,
            message: "Email không tồn tại!",
            redirectTo: "/user/password/forgot"
        });
        return;
    };
    const existEmail = await ForgotPassword.findOne({
        raw: true,
        where: {
            email: email
        }
    });

    if (existEmail) {

        req.flash("error", "Vui lòng thực hiện lại thao tác sau 3 phút!");
        return;
    }
    const otp = generateRandomNumber(6);

    req.flash('success', "Đã gửi mã Otp về Email của bạn! ");

    await ForgotPassword.create({
        email: email,
        otp: otp,
        expire: new Date(Date.now() + 7 * 60 * 60 * 1000),
    });

    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
        Mã OTP để lấy lại mật khẩu là <b style="coler: green;" >${otp}</b>. Thời hạn sử dụng là 3 phút.
    `

    sendMailHelper(email, subject, html);

    setTimeout(async () => {
        await ForgotPassword.destroy({
            where: {
                email: email,
                expire: {
                    [Op.lt]: new Date(Date.now() + 7 * 60 * 60 * 1000)
                }
            }
        });

    }, 3 * 60 * 1000);

    res.json({
        code: 200,
        message: "Gửi mã Otp thành công",
    });
}

// [GET] /user/info
export const info = async (req: Request, res: Response) => {

    res.render("client/pages/user/info", {
        pageTitle: "Thông tin tài khoản",
    });

};

// [GET] /user/logout
export const logout = (req: Request, res: Response) => {

    res.clearCookie("tokenUser");

    res.redirect("/");

};


// [GET] /user/otp-password
export const otpPassword = async (req: Request, res: Response) => {

    res.render("client/pages/user/otp-password", {
        pageTitle: "Nhập mã otp",
        messages: {
            error: req.flash("error"),
            success: req.flash("success")
        }
    });

};

// [POST] /user/otp-password
export const otpPasswordPost = async (req: Request, res: Response) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const otpPassword = await ForgotPassword.findOne({
        raw: true,
        where: {
            email: email,
            otp: otp
        }

    });

    if (otpPassword) {
        req.flash("success", "Xác thực thành công! ");
        res.json({
            code: 200,
            message: " Nhập mã Otp hợp lệ",
        });
    }

    req.flash("error", "Nhập mã xác thực không thành công! ");
    return;
}

// [GET] /user/resetPassword
export const resetPassword = async (req: Request, res: Response) => {

    res.render("client/pages/user/reset-password", {
        pageTitle: "Khôi phục mật khẩu",
        messages: {
            error: req.flash("error"),
            success: req.flash("success")
        }
    });

};


// [POST] /user/resetPassword
export const resetPasswordPost = async (req: Request, res: Response) => {
    const password = md5(req.body.password);

    const email = req.body.email;

    await Customer.update(
        { password: password },
        {
            where: {
                email: email,
                status: "active",
                deleted: false
            }
        }
    );
    req.flash("success", "Thay đổi mật khẩu thành công!")
    res.json({
        code: 200,
        message: "Thay đổi mật khẩu thành công!"
    });


};

// [GET] /user/tourBookingHistory
export const tourBookingHistory = async (req: Request, res: Response) => {
    const token = req.cookies.tokenUser;
    let paidTotal: number = 0;
    let totalPrice: number = 0;
    // Tìm khách hàng với token
    const user = await Customer.findOne({
        raw: true,
        attributes: ['email'],
        where: {
            token: token,
            deleted: false,
            status: "active"
        }
    });


    const orderItems = await sequelize.query(`
        SELECT tours.images, orders_item.id, tours.title, tours.slug, orders_item.timeStart, orders_item.quantity, orders.status,
        orders.status,orders_item.paymentDate, orders_item.refund_date,
               ROUND(tours.price * (1 - tours.discount / 100), 0) AS price_special
        FROM tours
        JOIN orders_item ON tours.id = orders_item.tourId
        JOIN orders ON orders.id = orders_item.orderId
        WHERE orders.email = :email
            AND orders.deleted = false
            AND tours.deleted = false
            AND tours.status = 'active'
        ORDER BY orders_item.timeStart DESC
    `, {
        replacements: { email: user["email"] },
        type: QueryTypes.SELECT
    });

    orderItems.forEach(item => {
        if (item["images"]) {
            const images = JSON.parse(item["images"]);
            item["image"] = images[0];
        }
        item["timeStart"] = new Date(item["timeStart"]);
        const dayStart = String(item["timeStart"].getDate()).padStart(2, '0');
        const monthStart = String(item["timeStart"].getMonth() + 1).padStart(2, '0'); // Lấy tháng, nhớ cộng thêm 1 vì getMonth() trả về tháng từ 0-11
        const yearStart = String(item["timeStart"].getFullYear());

        item["timeStart"] = `${dayStart}/${monthStart}/${yearStart}`;
        
        item["paymentDate"] = new Date(item["paymentDate"]);
        const dayPayment = String(item["paymentDate"].getDate()).padStart(2, '0');
        const monthPayment = String(item["paymentDate"].getMonth() + 1).padStart(2, '0'); // Lấy tháng, nhớ cộng thêm 1 vì getMonth() trả về tháng từ 0-11
        const yearPayment = String(item["paymentDate"].getFullYear());
        item["paymentDate"] = `${dayPayment}/${monthPayment}/${yearPayment}`;
        
        item["refund_date"] = new Date(item["refund_date"]);
        const dayRefund = String(item["refund_date"].getDate()).padStart(2, '0');
        const monthRefund = String(item["refund_date"].getMonth() + 1).padStart(2, '0'); // Lấy tháng, nhớ cộng thêm 1 vì getMonth() trả về tháng từ 0-11
        const yearRefund = String(item["refund_date"].getFullYear());
        item["refund_date"] = `${dayRefund}/${monthRefund}/${yearRefund}`;

    
    
        item["price_special"] = parseFloat(item["price_special"]);
    
        if(item["status"] == "paid"){
            paidTotal+= item["price_special"] * item["quantity"];
        }
        totalPrice += item["price_special"] * item["quantity"];
      
    });


    res.render("client/pages/user/tourBookingHistory", {
        pageTitle: "Lịch sử đơn đặt hàng",
        orderItems: orderItems,
        totalPrice: totalPrice,
        paidTotal: paidTotal
    });
};

// [GET] /user/tourBookingHistory/cancelTourcancelTour
export const cancelTour = async (req: Request, res: Response) => {
    res.render("client/pages/user/tourBookingHistory", {
        pageTitle: "Hủy Tour",
        messages: {
            error: req.flash("error"),
            success: req.flash("success")
        }
    });
};

// [POST] /user/tourBookingHistory/cancelTourcancelTour
export const cancelTourPost = async (req: Request, res: Response) => {
    const token = req.cookies.tokenUser;
    const orderItemId = req.body.orderItemId;

    // Tìm khách hàng
    const user = await Customer.findOne({
        raw: true,
        attributes: ['email'],
        where: {
            token,
            deleted: false,
            status: "active"
        }
    });

    // Lấy orderId từ orderItemId
    interface OrderItemResult {
        orderId: number;
    }

    const orderitem = await orderItem.findOne({
        raw: true,
        where: {
            id: orderItemId
        }

    });

    const tour = await Tour.findOne({
        raw: true,
        where: {
            id: orderitem["tourId"]
        }
    });
    const stock = tour["stock"] + orderitem["quantity"];

    console.log(stock);
    await Tour.update(
        { stock: stock }, {
        where: { id: tour["id"] }
    });


    const result = await sequelize.query<OrderItemResult>(`
        SELECT oi.orderId
        FROM orders_item AS oi
        WHERE oi.id = :orderItemId
        LIMIT 1
    `, {
        replacements: { orderItemId },
        type: QueryTypes.SELECT
    });

    const orderId = result[0]?.orderId;

    // Xóa item trong orders_item
    await sequelize.query(`
        DELETE oi
        FROM orders_item AS oi
        JOIN tours ON tours.id = oi.tourId
        JOIN orders ON orders.id = oi.orderId
        WHERE orders.email = :email
            AND oi.id = :itemId
            AND orders.deleted = false
            AND tours.deleted = false
            AND tours.status = 'active'
    `, {
        replacements: {
            email: user["email"],
            itemId: orderItemId
        },
        type: QueryTypes.DELETE
    });

    // Kiểm tra còn item nào trong đơn hàng không
    const countResult = await sequelize.query<{ count: number }>(`
        SELECT COUNT(*) AS count
        FROM orders_item
        WHERE orderId = :orderId
    `, {
        replacements: { orderId },
        type: QueryTypes.SELECT
    });

    const countItems = countResult[0]?.count || 0;

    if (countItems === 0) {
        await sequelize.query(`
            DELETE FROM orders
            WHERE id = :orderId
              AND email = :email
              AND deleted = false
        `, {
            replacements: {
                orderId,
                email: user["email"]
            },
            type: QueryTypes.DELETE
        });
    }

    req.flash("success", "Hủy đơn hàng thành công!");

    res.json({
        code: 200,
        message: `Hủy Tour Thành Công!`
    });
};

export const refundMoney = async (req: Request, res: Response) => {
    
    res.render("client/pages/user/tourBookingHistory", {
        pageTitle: "Hủy Tour",
        messages: {
            error: req.flash("error"),
            success: req.flash("success")
        }
    });
};


// [GET] /user/payment
export const payment = async (req: Request, res: Response) => {
    const token = req.cookies.tokenUser;
    let totalPrice: number = 0;

    // Tìm khách hàng với token
    const user = await Customer.findOne({
        raw: true,
        attributes: ['email'],
        where: { token, deleted: false, status: "active" }
    });


    // Lấy các mục đơn hàng
    const orderItems = await sequelize.query(`
            SELECT tours.images, orders_item.id, tours.title, tours.slug, orders_item.timeStart, orders_item.quantity, orders.status,
                   ROUND(tours.price * (1 - tours.discount / 100), 0) AS price_special
            FROM tours
            JOIN orders_item ON tours.id = orders_item.tourId
            JOIN orders ON orders.id = orders_item.orderId
            WHERE orders.email = :email
                AND orders.deleted = false
                AND tours.deleted = false
                AND tours.status = 'active'
        `, {
        replacements: { email: user["email"] },
        type: QueryTypes.SELECT
    });

    orderItems.forEach(item => {
        if (item["images"]) {
            const images = JSON.parse(item["images"]);
            item["image"] = images[0];
        }
        item["price_special"] = parseFloat(item["price_special"]);
        totalPrice += item["price_special"] * item["quantity"];
    });
    // Lấy các voucher
    const vouchers = await Voucher.findAll({
        raw: true,
        where: { deleted: false, status: "active" }
    });

    // Tính thời gian còn lại đối với từng voucher
    vouchers.forEach(item => {
        item["expire"] = new Date(item["expire"]);
        const currentDate: Date = new Date();
        const timeDiff = item["expire"].getTime() - currentDate.getTime();
        item["daysLeft"] = Math.ceil(timeDiff / (1000 * 3600 * 24));
    });


    res.render("client/pages/user/payment", {
        pageTitle: "Thanh toán đơn hàng",
        orderItems: orderItems,
        totalPrice: totalPrice,
        vouchers: vouchers

    });

}

// [GET] /user/voucher
export const voucher = async (req: Request, res: Response) => {
    const vouchers = await Voucher.findAll({
        raw: true
        , where: {
            deleted: false,
            status: "active"
        }
    });
    vouchers.forEach(item => {

        item["expire"] = new Date(item["expire"]);

        const currentDate: Date = new Date();
        const timeDiff = item["expire"].getTime() - currentDate.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        item["daysLeft"] = daysLeft
    });
    res.render("client/pages/user/voucher", {
        pageTitle: "Mã Giảm Giá",
        messages: {
            error: req.flash("error"),
            success: req.flash("success")
        },
        vouchers: vouchers
    });
};

