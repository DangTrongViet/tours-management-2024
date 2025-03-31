import express, { Request, Response } from "express";
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries
import Order from "../../models/orders.model";
import orderItem from "../../models/orders_item.model";
import Tour from "../../models/tour.model";

// [POST] orders

export const order = async (req: Request, res: Response): Promise<any> => {
    const {customerInfo, cart, status} = req.body;
    try {
        
    // Kiểm tra tính hợp lệ của dữ liệu
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.phone) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    if(!cart){
        return res.status(400).json({ message: "Giỏ hàng trống không!" });
    }

    const order = await Order.create({
        email: customerInfo.email,
        phone: customerInfo.phone,
        fullName: customerInfo.fullName,
        note: customerInfo.note || "",
        status: status
     })

     await order.update({ code: `ORD00${order["id"]}` });

    for(const item of cart){
        const tour  = await Tour.findOne({
            where: {
                id: item["id"],
                deleted: false,
                status: "active"
            },
            raw: true
        })
        await orderItem.create({
            orderId: order["id"],
            tourId: tour["id"],
            discount: tour["discount"],
            price: tour["price"],
            quantity: item["quantity"],
            timeStart: Date.now(),

        })
    }
            // Trả về kết quả dưới dạng JSON
            res.json({
                code: 200,
                message: "Lưu đơn đặt thành công",
                customerInfo: customerInfo ,
                cart: cart
            });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi lấy danh sách customers",
            error: error.message,
        });
    }
}
