import { Request, Response } from "express";
import Tour from "../../models/tour.model";
import Order from "../../models/orders.model";
import orderItem from "../../models/orders_item.model";
import { generateRandomNumber } from "../../helpers/generate";


export const index = async (req: Request, res: Response) => {

    res.render("client/pages/cart/index", {
        pageTitle: "Giỏ hàng",

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

        if (fullName) {
            data.order["fullName"] = fullName;
        }
        if (email) {
            data.order["email"] = email;
        }
        if (phone) {
            data.order["phone"] = phone;
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
            attributes: ['id', 'title', 'images', 'price', 'discount', 'slug'],
            where: {
                id: tourId,
                deleted: false,
                status: "active"
            }
        });

        tour["quantity"] = quantity;

        detailCart.push(tour);




        if(order["id"]){
            await orderItem.create({
                orderId: order["id"],
                tourId: tourId,
                quantity: quantity,
                price: tour["price"],
                discount: tour["discount"]
            });
            data.order["orderId"] = order["id"];
    
        }


    }


    data.cart["detailCart"] = detailCart;
    

    res.json({
        code: 200,
        message: "Thành công",
        data: data
    });


}

