import { Request, Response } from "express";

import Category from "../../models/category.model";
import { objPagination as paginationHelper } from "../../helpers/pagination";


export const index = async (req: Request, res: Response) => {


    const countItems = await Category.count({ where: { deleted: false, status: 'active' } });

    let objPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countItems
    )

    const categories = await Category.findAll({
        where: {
            deleted: false,
            status: 'active'
        },
        limit: objPagination.limitItems,
        offset: objPagination.skip,
        raw: true
    });


    res.render("client/pages/categories/index", {
        pageTitle: "Danh sách danh mục",
        categories: categories,
        pagination: objPagination
    });
}