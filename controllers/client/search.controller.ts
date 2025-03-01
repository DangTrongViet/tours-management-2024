import { Request, Response } from "express";
import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";

export const index = async (req: Request, res: Response): Promise<void | any> => {
    const keyword: string = req.query.keyword as string;

    if (!keyword || keyword.trim() === "") {
        return res.render("client/pages/search/index", {
            pageTitle: "Kết quả tìm kiếm",
            tours: [],
            message: "Vui lòng nhập từ khóa tìm kiếm"
        });
    }

    try {
        const tours = await sequelize.query(
            `
            SELECT tours.*, ROUND(price * (1 - discount / 100), 0) AS price_special
            FROM tours
            WHERE title LIKE ?
                AND tours.deleted = false
                AND tours.status = 'active'
            `,
            {
                replacements: [`%${keyword}%`], //Tránh SQL Injection
                type: QueryTypes.SELECT
            }
        );


        tours.forEach((item: any) => {
            if (item["images"]) {
                const images = JSON.parse(item["images"]);
                item["image"] = images[0];
            }
            item["price_special"] = parseFloat(item["price_special"]);
        });

      
        res.render("client/pages/search/index", {
            pageTitle: "Kết quả tìm kiếm",
            tours: tours
        });
    } catch (error) {
        console.error("Lỗi truy vấn tìm kiếm:", error);
    }
};
