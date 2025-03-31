import { Request, Response } from "express";
import Category from "../../models/category.model"; // Import Category model
import { objPagination } from "../../helpers/pagination"; // Import helper pagination

// [GET] Lấy danh sách các danh mục với phân trang
export const getCategories = async (req: Request, res: Response): Promise<any> => {
    const page = req.query.page as string || '1'; // Lấy trang từ query params, mặc định là 1
    const itemsPerPage = 5; // Số lượng danh mục mỗi trang
    
    try {
        // Lấy tổng số danh mục có điều kiện
        const countProduct = await Category.count({
            where: {
                status: "active",
                deleted: false
            }
        });

        // Tạo đối tượng phân trang với objPagination
        const pagination = objPagination(
            { currentPage: parseInt(page), limitItems: itemsPerPage }, 
            { page: page }, 
            countProduct
        );
        console.log( pagination);
        // Truy vấn danh mục theo phân trang
        const categories = await Category.findAll({
            raw: true,
            where: {
                status: "active",
                deleted: false
            },
            limit: pagination.limitItems,  // Sử dụng limitItems từ pagination
            offset: pagination.skip,       // Sử dụng skip từ pagination
        });

        // Trả về kết quả với phân trang
        res.status(200).json({
            code: 200,
            message: "Danh sách danh mục",
            data: categories,
            totalPages: pagination.totalPage, // Trả về tổng số trang từ objPagination
            currentPage: pagination.currentPage, // Trang hiện tại từ objPagination
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi lấy danh sách danh mục",
            error: error.message,
        });
    }
};
