import express, { Request, Response } from "express";
import { Op, where } from "sequelize"; // Import Sequelize operators
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries
import Customer from "../../models/customer.model";
import md5 from "md5"
import { generateRandomString } from "../../helpers/generate";
import { execSync } from "child_process";

// [POST] user/register

export const register = async (req: Request, res: Response): Promise<any> => {
    const userInfo = req.body; 
    try {

        if(!userInfo.email || !userInfo.phone || !userInfo.fullName){
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

        if(existCustomer){
            return res.json({
                code: 404,
                message: "Email đã tồn tại!",
                data: userInfo.email,
            });

        }

        const tokenUser  = generateRandomString(10);
        const customer = await Customer.create({
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
export const login = async (req: Request, res: Response ): Promise<any> => {
    const {email, password} = req.body;
 
    if(!email || !password){
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

    if(!existCustomer){
        return res.json({
            code: 404,
            message: "Không tồn tại email người dùng!"
        })
    }

    if(existCustomer["password"] !== md5(password)){

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
export const info = async (req: Request, res: Response ): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];

    if(!token){
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

    if(!existCustomer){
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
export const editInfo = async (req: Request, res: Response ): Promise<any> => {
    const token = req.headers['authorization']?.split(' ')[1];

    const {email, phone, fullName, avatar} = req.body;
    if(!token){
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

    if(!existCustomer){
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
    },{
        where: {token: token}

    });

    return res.json({
        code: 200,
        message: "Chỉnh sửa thông tin thành công!",
        data: existCustomer
    })

}
