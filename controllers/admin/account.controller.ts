import express, { Request, Response } from "express";
import { Op } from "sequelize"; // Import Sequelize operators
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries

// [GET] customers
export const index = async (req: Request, res: Response) => {
    try {

        // Truy vấn tour từ cơ sở dữ liệu với JOIN
        const customers = await sequelize.query(
            `
      SELECT *
      FROM customers
        WHERE status = "active"
        AND deleted = falss

      `,
            {
                type: QueryTypes.SELECT,
            }
        );


        // Trả về kết quả dưới dạng JSON
        res.json({
            code: 200,
            message: "Danh sách vouchers đã được lấy thành công",
            data: customers,
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


