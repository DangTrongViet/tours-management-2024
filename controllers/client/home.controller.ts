import { Request, Response } from "express";

import sequelize from "../../config/database";
import { QueryTypes } from "sequelize";

import Category from "../../models/category.model";

import toursCategories from "../../models/tours_categories.model";

export const index = async (req: Request, res: Response) => {
    
    
    const categories = await Category.findOne({
        where: {
            deleted: false,
            status: "active"
        },
        limit: 1,
        raw: true
    });

    const tours = await sequelize.query(`
        SELECT tours.*, ROUND(price * (1-discount/100) , 0) AS price_special
        FROM tours
        JOIN tours_categories ON tours.id = tours_categories.tour_id
        JOIN categories ON categories.id = tours_categories.category_id
        WHERE
            categories.slug = '${categories["slug"]}'
            AND categories.deleted = false
            AND categories.status = 'active'
            AND tours.deleted = false
            AND tours.status = 'active'
        
    `, {
        type: QueryTypes.SELECT
    });

    tours.forEach(item => {
        if (item["images"]) {
            const images = JSON.parse(item["images"]);
            item["image"] = images[0];
        }
        item["price_special"] = parseFloat(item["price_special"]);
    })

    
    res.render("client/pages/home/index", {
        pageTitle: "Danh sách danh mục",
        tours: tours
    });
}