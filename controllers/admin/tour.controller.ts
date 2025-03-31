import express, { Request, Response } from "express";
import { Op } from "sequelize"; // Import Sequelize operators
import sequelize from "../../config/database"; // Import sequelize instance
import { QueryTypes } from "sequelize"; // Import QueryTypes for raw queries
import Tour from "../../models/tour.model";

// [GET] tours
export const index = async (req: Request, res: Response) => {
    try {

        const { search, sortType, city, priceMin, priceMax, rating } = req.query;

        const whereConditions: any = {
            deleted: false,
            status: "active"
        };

        // Tìm kiếm theo tên tour
        if (search) {
            whereConditions.title = { [Op.like]: `%${search}%` };
        }

        // Tìm kiếm theo thành phố nếu có
        if (city) {
            whereConditions.city = { [Op.like]: `%${city}%` }; // Giả sử có trường city trong bảng tours
        }

        // Lọc theo đánh giá (rating) nếu có
        if (rating) {
            whereConditions.rating = rating; // Giả sử có trường rating trong bảng tours
        }

        // Lọc theo giá nếu có
        if (priceMin && priceMax) {
            whereConditions.price = { [Op.gte]: priceMin, [Op.lte]: priceMax }; // Lọc theo mức giá
        }

        // Truy vấn tour từ cơ sở dữ liệu với JOIN
        const tours = await sequelize.query(
            `
      SELECT tours.*, categories.title AS category_title, ROUND(tours.price * (1 - tours.discount / 100), 0) AS price_special
      FROM tours
      LEFT JOIN tours_categories ON tours.id = tours_categories.tour_id
      LEFT JOIN categories ON categories.id = tours_categories.category_id
      WHERE tours.deleted = false
      AND tours.status = 'active'
      ${city ? `AND categories.title LIKE '%${city}%'` : ''}
      ${rating ? `AND tours.rating = ${rating}` : ''}
      ${priceMin && priceMax ? `AND tours.price BETWEEN ${priceMin} AND ${priceMax}` : ''}
      ${search ? `AND tours.title LIKE '%${search}%'` : ''}
      ORDER BY tours.price ${sortType === 'asc' ? 'ASC' : 'DESC'}
      `,
            {
                type: QueryTypes.SELECT,
            }
        );


        // Trả về kết quả dưới dạng JSON
        res.json({
            code: 200,
            message: "Danh sách tour đã được lấy thành công",
            data: tours,
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

// [PUT] Cập nhật tour theo slug
export const updateTour = async (req: Request, res: Response): Promise<any> => {
    const { slug } = req.params; // Lấy slug từ tham số URL
    const {
        title,
        timeStart,
        price,
        stock,
        discount,
        information,
        status,
        images,
    } = req.body; // Lấy dữ liệu từ body của request

    try {
        // Kiểm tra xem tour có tồn tại không
        const tour = await Tour.findOne({
            where: { slug }, // Tìm tour theo slug
        });

        if (!tour) {
            res.status(404).json({
                code: 404,
                message: "Tour không tồn tại",
            });
            return;
        }

        // Cập nhật các trường tour
        tour["title"] = title || tour["title"];
        tour["timeStart"] = timeStart || tour["timeStart"];
        tour["price"] = price || tour["price"];
        tour["stock"] = stock || tour["stock"];
        tour["discount"] = discount || tour["discount"];
        tour["information"] = information || tour["information"];
        tour["status"] = status || tour["status"];
        tour["images"] = images || tour["images"];

        // Lưu thay đổi vào cơ sở dữ liệu
        await tour.save();

        // Trả về thông tin tour đã cập nhật
        res.json({
            code: 200,
            message: "Cập nhật tour thành công",
            data: tour,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi cập nhật tour",
            error: error.message,
        });
    }
};



// [POST] Thêm mới tour
export const addTour = async (req: Request, res: Response): Promise<void> => {
    const {
        title,
        code,
        images,
        price,
        discount,
        information,
        schedule,
        timeStart,
        stock,
        status,
        position,
        slug,
        deleted,
        deletedAt,
        createdAt,
        updatedAt,
        category_title,
    } = req.body; // Lấy dữ liệu từ body của request

    try {
        // Tạo tour mới
        const newTour = await Tour.create({
            title,
            code,
            images,
            price,
            discount,
            information,
            schedule,
            timeStart,
            stock,
            status,
            position,
            slug,
            deleted,
            deletedAt,
            createdAt,
            updatedAt,
            category_title,
        });

        // Trả về thông tin tour đã thêm
        res.status(201).json({
            code: 201,
            message: "Tạo mới tour thành công!",
            data: newTour,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi thêm tour",
            error: error.message,
        });
    }
};