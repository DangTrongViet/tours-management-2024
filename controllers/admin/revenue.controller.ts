import orderItem from "../../models/orders_item.model";
import express, { Request, Response } from "express";
// [POST] Thêm mới tour
export const revenue = async (req: Request, res: Response): Promise<any> => {
    const orderItems = await orderItem.findAll({
        raw: true,
        where: {
            status: "completed",
            deleted: false
        }
    });

    const totalPrice = orderItems.reduce((total, item) => {
        const itemTotal = parseFloat(item["price"]) * item["quantity"] * (1 - (item["discount"]) / 100);

        return total + itemTotal;
    }, 0);

    return res.json({
        code: 200,
        message: "Lấy ra doanh thu thành công!",
        revenue: totalPrice
    })
};