import express, { Request, Response } from "express";
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries
import Order from "../../models/orders.model";
import orderItem from "../../models/orders_item.model";
import Tour from "../../models/tour.model";

// [POST] orders
export const order = async (req: Request, res: Response): Promise<any> => {
    const { customerInfo, cart, status } = req.body;

    // Validate customerInfo and cart
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.email) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: "Giỏ hàng trống không!" });
    }

    const transaction = await sequelize.transaction(); // Start transaction

    try {
        // Fetch current order index from order_counters table
        const orderCounter = await Order.findOne({
            where: { id: 1 }, // Assuming you store a single counter
            transaction
        });

        let index = orderCounter ? orderCounter["index"] : 0; // Get the current index or start from 0

        // Create the order with a generated code
        const order = await Order.create({
            email: customerInfo.email,
            phone: customerInfo.phone,
            fullName: customerInfo.fullName,
            code: "ORD000" + index, // Generate order code with index
            note: customerInfo.note || "",
            status: status
        }, { transaction });

        // Add items to the order
        for (const item of cart) {
            // Fetch tour details for each item
            const tour = await Tour.findOne({
                where: {
                    id: item.id,
                    deleted: false,
                    status: "active"
                },
                raw: true,
                transaction
            });

            if (!tour) {
                // If tour not found or inactive, throw an error
                throw new Error(`Tour with ID ${item.id} not found or is inactive`);
            }

            // Check if the quantity in the cart exceeds available stock
            if (item.quantity > tour["stock"]) {
                throw new Error(`Không đủ số lượng cho tour "${tour["title"]}"`);
            }

            // Update tour stock
            await tour.update({
                stock: tour["stock"] - item.quantity
            }, { transaction });

            // Create orderItem entry for each cart item
            await orderItem.create({
                orderId: order["id"],
                tourId: tour["id"],
                discount: tour["discount"],
                price: tour["price"],
                quantity: item.quantity,
                timeStart: Date.now(),
            }, { transaction });
        }

        // After all actions, update the order counter to increment the index
        await Order.update(
            { index: index + 1 },
            { where: { id: 1 }, transaction }
        );

        // Commit the transaction after all actions are completed
        await transaction.commit();

        // Return the response
        res.json({
            code: 200,
            message: "Lưu đơn đặt thành công",
            customerInfo: customerInfo,
            cart: cart
        });

    } catch (error) {
        // Rollback the transaction if there's an error
        await transaction.rollback();
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi thêm dữ liệu order",
            error: error.message,
        });
    }
};

