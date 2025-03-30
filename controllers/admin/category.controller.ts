import express, { Request, Response } from "express";
import { Op } from "sequelize"; // Import Sequelize operators
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries

const router = express.Router();

// [GET] categories
export const index = async (req: Request, res: Response) => {
    try {

        const categories = await sequelize.query(
            `
        SELECT *
        FROM categories
        WHERE status = "active"
        AND deleted = false
        `,
            {
                type: QueryTypes.SELECT,
            }
        );


        // Trả về kết quả dưới dạng JSON
        res.json({
            code: 200,
            message: "Danh sách categories đã được lấy thành công",
            data: categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi lấy danh sách categories ",
            error: error.message,
        });
    }
}
