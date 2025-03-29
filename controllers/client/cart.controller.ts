import { Request, Response } from "express";
import Tour from "../../models/tour.model";
import Order from "../../models/orders.model";
import orderItem from "../../models/orders_item.model";
import { generateRandomNumber } from "../../helpers/generate";
import Customer from "../../models/customer.model";

export const index = async (req: Request, res: Response) => {

    res.render("client/pages/cart/index", {
        pageTitle: "Giỏ hàng",
        messages: {
            error: req.flash("error"),
        }

    });
}


export const checkout = async (req: Request, res: Response) => {
    let cart = [];
    const detailCart = [];
    let order = {};

    const data = {
        cart: {},
        order: {},

    }

    if (req.body.cart) {
        cart = req.body.cart;
    }

    const code = 'ORD' + generateRandomNumber(3);
    data.order["code"] = code;
    if (req.body.customer) {
        const { fullName, email, phone, note } = req.body.customer;

        if(email){
            const existCustomer = await Customer.findOne({
                raw: true,
                where: {
                    email: email,
                    status: "active",
                    deleted: false
                }
            });
            if(existCustomer){
                data.order["email"] = email;
            }
            else{
                return req.flash("error","Không tồn tại tài khoản với email này!");
            }
        }

        if (fullName) {
            data.order["fullName"] = fullName;
        }

        if (phone && phone.length == 10) {
            data.order["phone"] = phone;
        }
        if(phone && phone.length > 10 || phone < 10){
            return req.flash("error","Số điện thoại không hợp lệ!");
        }
        if (note) {
            data.order["note"] = note;
        }

        order = await Order.create({
            code: data.order["code"],
            fullName: data.order["fullName"],
            email: data.order["email"],
            phone: data.order["phone"],
            note: data.order["note"]

        });

    }


    for (const item of cart) {
        const tourId = item.tourId;
        const quantity = item.quantity;


        const tour = await Tour.findOne({
            raw: true,
            attributes: ['id', 'title', 'images', 'price', 'discount', 'slug', "stock"],
            where: {
                id: tourId,
                deleted: false,
                status: "active"
            }
        });


        tour["quantity"] = quantity;


        detailCart.push(tour);


        if (order["id"] && item["checked"] === true) {

            await orderItem.create({
                orderId: order["id"],
                tourId: tourId,
                quantity: quantity,
                price: tour["price"],
                discount: tour["discount"]
            });
            data.order["orderId"] = order["id"];

            await Tour.update(
                { stock: tour["stock"] - quantity},
                {where: {id : tour["id"] }}
            
            )

        }



    }


    data.cart["detailCart"] = detailCart;


    res.json({
        code: 200,
        message: "Thành công",
        data: data
    });


}

