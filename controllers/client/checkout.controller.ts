import { Request, Response } from "express";
import Order from "../../models/orders.model";

import Tour from "../../models/tour.model";
import { QueryTypes, where } from "sequelize";
import sequelize from "../../config/database";
import Voucher from "../../models/voucher.model";

import orderItem from "../../models/orders_item.model";

export const success = async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    let order = {
        userInfo: {},
        products: [],
        totalPrice: 0
    };

    try {
        const userInfo = await Order.findOne({
            raw: true,
            attributes: ["fullName", "email", "phone", "note"],
            where: { id: orderId, deleted: false }
        });

        order.userInfo = userInfo || {};

        const products = await orderItem.findAll({
            raw: true,
            where: { orderId: orderId }
        });

        let totalPrice = 0;

        // Fetching tour information in parallel
        const tours = await Promise.all(
            products.map(async (item) => {
                const tour = await Tour.findOne({
                    raw: true,
                    where: { id: item["tourId"] }
                });

                if (tour) {
                    item["title"] = tour["title"];
                    item["image"] = JSON.parse(tour["images"])[0];  // assuming the images field is a JSON array
                    item["priceNew"] = item["price"] * (1 - item["discount"] / 100);
                    item["totalPrice"] = item["quantity"] * item["priceNew"];
                    totalPrice += item["totalPrice"];
                }

                return item;
            })
        );

        order.products = tours;
        order.totalPrice = totalPrice;

        res.render("client/pages/checkout/success", {
            pageTitle: "Đặt hàng thành công",
            order: order
        });
    } catch (error) {
        console.error("Error in success handler:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const paymentSuccess = async (req: Request, res: Response) => {
    res.render("client/pages/checkout/payment-success", {
        pageTitle: "Thanh toán thành công"
    });
};

export const paymentSuccessPost = async (req: Request, res: Response) => {
    const { orderItemsId, voucherId } = req.body;
    let orders: any[] = [];
    let voucher: any[] = [];

    if (voucherId) {
        const detailVoucher = await Voucher.findOne({
            raw: true,
            where: {
                id: voucherId,
                deleted: false,
                status: "active"
            }

        })
        voucher.push(detailVoucher);
    }
    try {
        // Using Promise.all to handle the async loop in parallel
        await Promise.all(
            orderItemsId.map(async (itemId: string) => {
                const order = await orderItem.findOne({
                    raw: true,
                    where: { id: itemId }
                });
                await orderItem.update({
                    paymentDate: new Date()
                }, { where: { id: order["id"] } }
                )
                if (!order) {
                    return;
                }

                await Order.update(
                    {
                        status: "paid",
                    },
                    { where: { id: order["orderId"] } }
                );



                // Getting tour details with raw SQL query
                const [tour] = await sequelize.query(`
                    SELECT tours.*, ROUND(price * (1 - discount / 100), 0) AS price_special
                    FROM tours
                    WHERE tours.id = :tourId 
                    AND tours.deleted = false 
                    AND tours.status = 'active'`, {
                    replacements: { tourId: order["tourId"] },
                    type: QueryTypes.SELECT
                });


                if (tour) {
                    order["price_special"] = parseFloat(tour["price_special"]);
                    order["title"] = tour["title"];
                    order["slug"] = tour["slug"];
                    order["image"] = JSON.parse(tour["images"])[0];
                    order["date"] = new Date();
                    const vietnamOffset = 7 * 60;  // Vietnam is UTC+7, so offset in minutes
                    const vietnamDate = new Date(order["date"].getTime() + vietnamOffset * 60 * 1000);

                    // Format the date as "DD/MM/YYYY HH:mm:ss"
                    const day = String(vietnamDate.getDate()).padStart(2, '0');
                    const month = String(vietnamDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                    const year = vietnamDate.getFullYear();
                    const hours = String(vietnamDate.getHours()).padStart(2, '0');
                    const minutes = String(vietnamDate.getMinutes()).padStart(2, '0');
                    const seconds = String(vietnamDate.getSeconds()).padStart(2, '0');

                    // Final formatted date string in Vietnam time
                    const formattedVietnamTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

                    // Update order["date"] with formatted date in Vietnam time
                    order["date"] = formattedVietnamTime;


                    orders.push(order);
                }
            })
        );

        res.json({
            code: 200,
            message: "Thanh toán thành công!",
            orders: orders,
            voucher: voucher || []
        });
    } catch (error) {
        console.error("Error during payment success:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const refundMoneySuccess = async (req: Request, res: Response) => {
    
    res.render("client/pages/checkout/refundMoney-success", {
        pageTitle: "Hoàn tiền thành công"
    });
};


export const refundMoneySuccessPost = async (req: Request, res: Response): Promise<any> => {
    const orderItemId = req.body.orderItemId;

    const item = await orderItem.findOne({
        raw: true,
        where: {
            id: orderItemId
        }
    });

    // Get the order's time (time when the order was placed)
    const paymentDate = new Date(item["paymentDate"]);

    const refundMoneyDate = new Date();

    // Calculate the difference in days between current date and the order date
    const diffTime = Math.abs(refundMoneyDate.getTime() - paymentDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24)); // Convert milliseconds to days

    // If the refund is requested within 3 days
    let totalPriceRefund = 0;
    if (diffDays <= 3) {
       
        totalPriceRefund = (item["quantity"] * (item["price"] - (item["price"] * item["discount"] / 100))) * 0.7;
    }

    await orderItem.update({
        refund_date: refundMoneyDate
    }, {
        where: { id: orderItemId }
    });

    // Get the date and time in Vietnam's timezone
    const vietnamTime = refundMoneyDate.toLocaleString("en-GB", {
        timeZone: "Asia/Ho_Chi_Minh", // Vietnam's timezone
        hour12: false // Use 24-hour format
    });

    // Split the date and time parts
    const [datePart, timePart] = vietnamTime.split(", ");

    // Format the date as DD/MM/YYYY
    const [day, month, year] = datePart.split("/");

    // Format the time as HH:mm:ss
    const [hours, minutes, seconds] = timePart.split(":");

    // Final formatted date string in Vietnam time
    const formattedVietnamTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    const tour = await Tour.findOne({
        raw: true,
        where: {
            id: item["tourId"],
            status: "active",
            deleted: false
        }
    });
    tour["quantity"] = item["quantity"]

    tour["price_special"] = tour["price"] - (tour["price"] * (tour["discount"]/100))

    await Tour.update({
        stock: item["quantity"] + tour["stock"]
    }, {
        where: { id: item["tourId"] }
    });

    await Order.update({
        status: "refund completed"
    }, {
        where: { id: item["orderId"] }
    });

    if (totalPriceRefund === 0) {
        return res.json({
            code: 400,
            message: "Hoàn tiền không thành công, quá 3 ngày sau khi đặt hàng.",
        });
    }

    res.json({
        code: 200,
        message: "Hoàn tiền thành công",
        tour: tour,
        totalPriceRefund: totalPriceRefund.toLocaleString(),
        refundMoneyDate: formattedVietnamTime
    });
};
