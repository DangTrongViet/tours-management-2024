import { Request, Response } from "express";
import Order from "../../models/orders.model";
import orderItem from "../../models/orders_item.model";
import Tour from "../../models/tour.model";
import { or } from "sequelize";
import { userRoute } from "../../routes/client/user.route";


export const success = async (req: Request, res: Response) => {

    const orderId = req.params.orderId;
    let order = {
        userInfo: {},
        products: {},
        totalPrice: 10
    };
    let totalPrice: number = 0;

    const userInfo = await Order.findOne({
        raw: true,
        attributes: ["fullName", "email", "phone", "note"],
        where: {
            id: orderId,
            deleted: false
        }
    });

    order.userInfo = userInfo;

    const products = await orderItem.findAll({
        raw: true,
        where: {
            orderId: orderId
        }

    });

    for (const item of products) {
        const tour = await Tour.findOne({
            raw: true,
            where: {
                id: item["tourId"]
            }
        });
        item["title"] = tour["title"];
        item["image"] = JSON.parse(tour["images"])[0];
        item["priceNew"]  = item["price"] * (1 - item["discount"]/100);
        item["totalPrice"]  =item["quantity"] * item["price"] * (1 - item["discount"]/100);
        totalPrice += item["totalPrice"]

    }
    order.products = products;
    order.totalPrice = totalPrice;

    res.render("client/pages/checkout/success", {
        pageTitle: "Đặt hàng thành công",
        order: order
    });
}



