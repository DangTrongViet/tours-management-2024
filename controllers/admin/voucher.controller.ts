import express, { Request, Response } from "express";
import { Op } from "sequelize"; // Import Sequelize operators
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries
import dayjs from "dayjs"
import Voucher from "../../models/voucher.model";
const router = express.Router();

// [GET] vouchers
export const index = async (req: Request, res: Response) => {
    try {

        // Truy vấn tour từ cơ sở dữ liệu với JOIN
        const vouchers = await sequelize.query(
            `
      SELECT *
      FROM vouchers
        WHERE 
            deleted = false
            

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

// [POST] addVoucher
export const addVoucher = async (req: Request, res: Response): Promise<any> => {
    const { discount, minAmount, expire, status, deleted, deletedAt, createdAt, updatedAt } = req.body;

    // Kiểm tra tính hợp lệ của dữ liệu
    if (!discount || !minAmount || !expire) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // Tạo voucher mới
    const newVoucher = {
        discount,
        minAmount,
        expire: dayjs(expire).toISOString(),
        status: status || "Active",
        deleted: deleted || false,
        deletedAt: deletedAt || null,
        createdAt: createdAt || new Date().toISOString(),
        updatedAt: updatedAt || new Date().toISOString(),
    };

    try {
        // Lưu voucher vào cơ sở dữ liệu
        const createdVoucher = await Voucher.create(newVoucher);

        // Trả về thành công
        res.status(201).json({
            message: "Tạo mới voucher thành công!",
            voucher: createdVoucher,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi thêm voucher vào cơ sở dữ liệu",
            error: error.message,
        });
    }
};

export const updateVoucher = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params; // Lấy id từ tham số URL
    const {
        discount,
        minAmount,
        expire,
        status,
        deleted,
        deletedAt,
        createdAt,
        updatedAt,
    } = req.body; // Lấy dữ liệu từ body của request

    try {
        // Kiểm tra xem voucher có tồn tại không
        const voucher = await Voucher.findOne({
            where: { id },
        });

        if (!voucher) {
            return res.status(404).json({
                code: 404,
                message: "Voucher không tồn tại",
            });
        }

        // Cập nhật các trường voucher
        voucher["discount"] = discount || voucher["discount"];
        voucher["minAmount"] = minAmount || voucher["minAmount"];
        voucher["expire"] = dayjs(expire).toISOString() || voucher["expire"]; // Chuyển ngày tháng sang ISO string
        voucher["status"] = status || voucher["status"];
        voucher["deleted"] = deleted || voucher["deleted"];
        voucher["deletedAt"] = deletedAt ? dayjs(deletedAt).toISOString() : null;
        voucher["createdAt"] = createdAt ? dayjs(createdAt).toISOString() : voucher["createdAt"];
        voucher["updatedAt"] = updatedAt ? dayjs(updatedAt).toISOString() : new Date().toISOString();

        // Lưu thay đổi vào cơ sở dữ liệu
        await voucher.save();

        // Trả về thông tin voucher đã cập nhật
        res.json({
            code: 200,
            message: "Cập nhật voucher thành công",
            data: voucher,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi cập nhật voucher",
            error: error.message,
        });
    }
};
export default router;
