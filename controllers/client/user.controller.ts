import express, { Request, Response } from "express";
import { Op, where } from "sequelize"; // Import Sequelize operators
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries
import Customer from "../../models/customer.model";
import md5 from "md5"
import { generateRandomString } from "../../helpers/generate";
import { execSync } from "child_process";
import Order from "../../models/orders.model";
import orderItem from "../../models/orders_item.model";
import Tour from "../../models/tour.model";

// [POST] user/register

export const register = async (req: Request, res: Response): Promise<any> => {
    const userInfo = req.body;
    try {

        if (!userInfo.email || !userInfo.phone || !userInfo.fullName) {
            return res.json({
                code: 404,
                message: "Yêu cầu nhập đầy đủ thông tin!"
            });
        }
        const existCustomer = await Customer.findOne({
            where: {
                email: userInfo.email,
                status: "active",
                deleted: false
            },
            raw: true
        });

        if (existCustomer) {
            return res.json({
                code: 404,
                message: "Email đã tồn tại!",
                data: userInfo.email,
            });

        }

        const tokenUser = generateRandomString(21);
        await Customer.create({
            fullName: userInfo.fullName,
            email: userInfo.email,
            phone: userInfo.phone,
            password: md5(userInfo.password),
            token: tokenUser
        })


        res.json({
            code: 200,
            message: "Tạo tài khỏan thành công!",
            data: {
                email: userInfo.email,

            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi lấy danh sách tour",
            error: error.message,
        });
    }
}

// [POST] /user/login
export const login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    console.log(password);
    if (!email || !password) {
        return res.json({
            code: 404,
            message: "Yêu cầu nhập đầy đủ thông tin!"
        });
    }

    const existCustomer = await Customer.findOne({
        raw: true,
        where: {
            email: email,
            deleted: false,
            status: "active"
        }
    });

    if (!existCustomer) {
        return res.json({
            code: 404,
            message: "Không tồn tại email người dùng!"
        })
    }

    if (existCustomer["password"] !== md5(password)) {

        return res.json({
            code: 404,
            message: "Mật khẩu không đúng !"
        })
    }

    return res.json({
        code: 200,
        message: "Đăng nhập thành công!",
        data: {
            tokenUser: existCustomer["token"],
            role: existCustomer["role"]
        }
    })

}


// [GET] /user/info
export const info = async (req: Request, res: Response): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.json({
            code: 404,
            message: "Yêu cầu gửi token!"
        });
    }

    const existCustomer = await Customer.findOne({
        raw: true,
        where: {
            token: token,
            deleted: false,
            status: "active"
        },
        attributes: ["fullName", "email", "phone", "avatar"]
    });

    if (!existCustomer) {
        return res.json({
            code: 404,
            message: "Không tồn tại thông tin người dùng!"
        })
    }

    return res.json({
        code: 200,
        message: "Đăng nhập thành công!",
        data: existCustomer
    })

}



// [PUT] /user/editInfo
export const editInfo = async (req: Request, res: Response): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];

    const { email, phone, fullName, avatar } = req.body;
    if (!token) {
        return res.json({
            code: 404,
            message: "Yêu cầu gửi token!"
        });
    }

    const existCustomer = await Customer.findOne({
        raw: true,
        where: {
            token: token,
            deleted: false,
            status: "active"
        },
        attributes: ["fullName", "email", "phone", "avatar"]
    });

    if (!existCustomer) {
        return res.json({
            code: 404,
            message: "Không tồn tại thông tin người dùng!"
        })
    }


    await Customer.update({
        email: email || existCustomer["email"],
        phone: phone || existCustomer["phone"],
        fullName: fullName || existCustomer["fullName"],
        avatar: avatar || existCustomer["avatar"]
    }, {
        where: { token: token }

    });

    return res.json({
        code: 200,
        message: "Chỉnh sửa thông tin thành công!",
        data: existCustomer
    })

}


// [GET] /user/tourBookingHistory
export const tourBookingHistory = async (req: Request, res: Response): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.json({
            code: 404,
            message: "Yêu cầu gửi token!"
        });
    }

    const existCustomer = await Customer.findOne({
        raw: true,
        where: {
            token: token,
            deleted: false,
            status: "active"
        },
        attributes: ["fullName", "email", "phone", "avatar", "id"]
    });

    if (!existCustomer) {
        return res.json({
            code: 404,
            message: "Không tồn tại thông tin người dùng!"
        })
    }

    const orderItems = await sequelize.query(
        `
    SELECT t.title, t.images, oi.* , ROUND(t.price * (1 - t.discount / 100), 0) AS price_special
    FROM tours as t
    JOIN orders_item as oi ON t.id = oi.tourId
    JOIN orders as o ON o.id = oi.orderId
    JOIN customers as c ON o.email = c.email
    WHERE oi.deleted = false
    AND t.deleted = false
    AND t.status = 'active'
    AND o.email = '${existCustomer["email"]}' 
    ORDER BY oi.id DESC 
    `,
        {
            type: QueryTypes.SELECT,
        }
    );

    for (const item of orderItems) {
        if (item["status"] === null) {
            item["status"] = "pending"
        }
        item["images"] = JSON.parse(item["images"])[0];

        if (item["status"] === "pending") {
            item["status"] = "Đang xử lý";
        }

        if (item["status"] === "completed") {
            item["status"] = "Đã hoàn thành";
        }

    }

    return res.json({
        code: 200,
        message: "Lấy ra thông tin đơn hàng  thành công!",
        data: {
            tokenUser: token,
            orderItems
        }
    })
}


// [GET] /user/payment
export const payment = async (req: Request, res: Response): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.json({
            code: 404,
            message: "Yêu cầu gửi token!"
        });
    }

    const existCustomer = await Customer.findOne({
        raw: true,
        where: {
            token: token,
            deleted: false,
            status: "active"
        },
        attributes: ["fullName", "email", "phone", "avatar", "id"]
    });

    if (!existCustomer) {
        return res.json({
            code: 404,
            message: "Không tồn tại thông tin người dùng!"
        })
    }

    const orderItems = await sequelize.query(
        `
    SELECT t.title, t.images, oi.*, ROUND(t.price * (1 - t.discount / 100), 0) AS price_special
    FROM tours as t
    JOIN orders_item as oi ON t.id = oi.tourId
    JOIN orders as o ON o.id = oi.orderId
    JOIN customers as c ON o.email = c.email
    WHERE oi.deleted = false
    AND t.deleted = false
    AND t.status = 'active'
    AND o.email = '${existCustomer["email"]}' 
    ORDER BY o.id DESC 
    `,
        {
            type: QueryTypes.SELECT,
        }
    );

    for (const item of orderItems) {
        if (item["status"] === null) {
            item["status"] = "pending"
        }
        item["images"] = JSON.parse(item["images"])[0];

        if (item["status"] === "pending") {
            item["status"] = "Đang xử lý";
        }

        if (item["status"] === "completed") {
            item["status"] = "Đã hoàn thành";
        }

    }



    return res.json({
        code: 200,
        message: "Lấy ra thông tin đơn hàng  thành công!",
        data: {
            tokenUser: token,
            orderItems
        }
    })
}

// [PUT] /user/cancelTour
export const cancelTour = async (req: Request, res: Response): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { orderId, orderItemId } = req.body;
    if (!token) {
        return res.json({
            code: 404,
            message: "Yêu cầu gửi token!"
        });
    }

    const existCustomer = await Customer.findOne({
        raw: true,
        where: {
            token: token,
            deleted: false,
            status: "active"
        },
        attributes: ["fullName", "email", "phone", "avatar", "id"]
    });

    if (!existCustomer) {
        return res.json({
            code: 404,
            message: "Không tồn tại thông tin người dùng!"
        })
    }

    const oi = await orderItem.findOne({
        raw: true,
        where: {
            id: orderItemId,
            deleted: false
        }
    })

    const tour = await Tour.findOne({
        raw: true,
        where: {
            id: oi["tourId"],
            deleted: false,
            status: "active"
        }
    });

    await tour.update({
        stock: tour["stock"] + oi["quantity"] 
    })

    await orderItem.update(
        { deleted: true },  // Dữ liệu cần cập nhật
        { where: { id: orderItemId } }  // Điều kiện cập nhật
    );

    const orders = await orderItem.findAll({
        where: {
            orderid: orderItemId
        }
    });


    if (orders.length == 0) {
        await Order.update(
            { deleted: true },  // Dữ liệu cần cập nhật
            { where: { id: orderId } }  // Điều kiện cập nhật
        );
    };

    return res.json({
        code: 200,
        message: "Đã hủy tour thành công!",
        data: {
            tokenUser: token,
            orderId: orderId
        }
    })
}

// [PUT] /user/paymentPost
export const paymentPost = async (req: Request, res: Response): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];
    const orderItemsId = req.body.orderItemsId;
    let odI = [];
    if (!token) {
        return res.json({
            code: 404,
            message: "Yêu cầu gửi token!"
        });
    }

    const existCustomer = await Customer.findOne({
        raw: true,
        where: {
            token: token,
            deleted: false,
            status: "active"
        },
        attributes: ["fullName", "email", "phone", "avatar", "id"]
    });

    if (!existCustomer) {
        return res.json({
            code: 404,
            message: "Không tồn tại thông tin người dùng!"
        })
    }

    for (const id of orderItemsId) {
        const oi = await orderItem.findOne({
            where: {
                deleted: false,
                id: id
            }
        })
        if (!oi) {
            return res.json({
                code: 404,
                message: `Không có thông tin đơn hàng ${id}!`,
                token: token
            })
        }
        const item = await oi.update({
            paymentDate: Date.now(),
            status: "completed"
        },
            {
                where: { id: id }
            })
        odI.push(item)
    }

    return res.json({
        code: 200,
        message: "Đã thanh toán thành công!",
        data: {
            tokenUser: token,
            orderItems: odI
        }
    })
}

// [GET] user/paymentSuccess
export const paymentSuccess = async (req: Request, res: Response): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];
    let odI = [];
    if (!token) {
        return res.json({
            code: 404,
            message: "Yêu cầu gửi token!"
        });
    }

    const existCustomer = await Customer.findOne({
        raw: true,
        where: {
            token: token,
            deleted: false,
            status: "active"
        },
        attributes: ["fullName", "email", "phone", "avatar", "id"]
    });

    if (!existCustomer) {
        return res.json({
            code: 404,
            message: "Không tồn tại thông tin người dùng!"
        })
    }

    const orderItems = await sequelize.query(
        `
    SELECT t.title, t.images, oi.*, ROUND(t.price * (1 - t.discount / 100), 0) AS price_special
    FROM tours as t
    JOIN orders_item as oi ON t.id = oi.tourId
    JOIN orders as o ON o.id = oi.orderId
    JOIN customers as c ON o.email = c.email
    WHERE oi.deleted = false
    AND oi.status = "completed"
    AND t.deleted = false
    AND t.status = 'active'
    AND o.email = '${existCustomer["email"]}' 
    ORDER BY oi.id DESC 
    `,
        {
            type: QueryTypes.SELECT,
        }
    );


    for (const item of orderItems) {
        item["images"] = JSON.parse(item["images"])[0];
    }


    return res.json({
        code: 200,
        message: "Đã thanh toán thành công!",
        data: {
            tokenUser: token,
            orderItems: orderItems
        }
    })
}

export const refundMoney = async (req: Request, res: Response): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];
    const orderItemId = req.body.orderItemId;
    // Check for token in the request headers
    if (!token) {
        return res.json({
            code: 404,
            message: "Yêu cầu gửi token!"
        });
    }

    try {
        // Check if the customer exists
        const existCustomer = await Customer.findOne({
            raw: true,
            where: {
                token: token,
                deleted: false,
                status: "active"
            },
            attributes: ["fullName", "email", "phone", "avatar", "id"]
        });

        if (!existCustomer) {
            return res.json({
                code: 404,
                message: "Không tồn tại thông tin người dùng!"
            });
        }

        // Check if the order item exists
        const oi = await orderItem.findOne({
            where: {
                deleted: false,
                status: "completed",
                id: orderItemId
            }
        });

        if (!oi) {
            return res.json({
                code: 404,
                message: `Không có thông tin đơn hàng ${orderItemId}!`,
                token: token
            });
        }

        // Get the payment date and calculate the time difference in days
        const paymentDate = new Date(oi["paymentDate"]);
        const currentDate = new Date();
        const daysDifference = (currentDate.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24);

        // If the difference is greater than 3 days, do not allow a refund
        if (daysDifference > 3) {
            return res.json({
                code: 404,
                message: "Không thể hoàn tiền!",
            
            });
        }

       
        const item = await oi.update({
            refund_date: Date.now(),
            status: "refund completed"
        },
        {
            where: { id: orderItemId }
        });

        // Return success response
        return res.json({
            code: 200,
            message: "Đã hoàn tiền thành công!",
            data: {
                tokenUser: token,
                orderItem: item
            }
        });

    } catch (error) {
        // Handle unexpected errors
        console.error(error);
        return res.json({
            code: 500,
            message: "Đã có lỗi xảy ra. Vui lòng thử lại sau!"
        });
    }
};
