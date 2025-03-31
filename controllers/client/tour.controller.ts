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

export const getTourDetail = async (req: Request, res: Response): Promise<any> => {
    const { slug } = req.params; // Lấy slug từ params
  
    try {
      // Tìm tour theo slug
      const tour = await Tour.findOne({
        where: { slug }, // Tìm theo slug
        raw: true,
      });
  
      if (!tour) {
        return res.status(404).json({
          code: 404,
          message: "Tour không tìm thấy",
        });
      }
  
      // Trả về thông tin tour chi tiết
      res.status(200).json({
        code: 200,
        message: "Chi tiết tour",
        data: tour,
      });
    } catch (error) {
      console.error("Error getting tour:", error);
      res.status(500).json({
        code: 500,
        message: "Lỗi khi lấy chi tiết tour",
        error: error.message,
      });
    }
  };