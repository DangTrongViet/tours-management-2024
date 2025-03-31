import express, { Request, Response } from "express";
import { Op } from "sequelize"; // Import Sequelize operators
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries
import Category from "../../models/category.model";

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


// [PUT] Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response): Promise<any> => {
    const { slug } = req.params; // Lấy slug từ tham số URL
    const { title, description, status, image } = req.body; // Lấy các thông tin từ body
  
    try {
      // Tìm danh mục theo slug
      const category = await Category.findOne({
        where: { slug },
      });
  
      if (!category) {
        return res.status(404).json({
          code: 404,
          message: "Danh mục không tồn tại",
        });
      }
  
      // Cập nhật các trường danh mục
      category["title"] = title || category["title"];
      category["description"] = description || category["description"];
      category["status"] = status || category["status"];
      category["image"] = image || category["image"];
  
      // Lưu thay đổi vào cơ sở dữ liệu
      await category.save();
  
      // Trả về thông tin danh mục đã cập nhật
      res.status(200).json({
        code: 200,
        message: "Cập nhật danh mục thành công!",
        data: category,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        code: 500,
        message: "Đã xảy ra lỗi khi cập nhật danh mục",
        error: error.message,
      });
    }
  };


  
// [POST] Thêm mới danh mục
export const addCategory = async (req: Request, res: Response): Promise<any> => {
    const { title, description, status, image, position, slug } = req.body;
  
    try {
      // Tạo danh mục mới
      const newCategory = await Category.create({
        title,
        description,
        status,
        image,
        position,
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  
      // Trả về thông tin danh mục đã thêm
      res.status(201).json({
        code: 201,
        message: "Tạo danh mục thành công!",
        data: newCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        code: 500,
        message: "Đã xảy ra lỗi khi thêm danh mục",
        error: error.message,
      });
    }
  };