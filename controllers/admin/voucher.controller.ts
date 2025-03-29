import express, { Request, Response } from "express";
import { Op } from "sequelize"; // Import Sequelize operators
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries

const router = express.Router();

// [GET] vouchers
export const index = async (req: Request, res: Response) => {
    try {

        // Truy vấn tour từ cơ sở dữ liệu với JOIN
        const vouchers = await sequelize.query(
            `
      SELECT *
      FROM vouchers
        WHERE status = "Active"
        AND deleted = false
            

      `,
            {
                type: QueryTypes.SELECT,
            }
        );


        // Trả về kết quả dưới dạng JSON
        res.json({
            code: 200,
            message: "Danh sách vouchers đã được lấy thành công",
            data: vouchers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi lấy danh sách vouchers",
            error: error.message,
        });
    }
}

export default router;
