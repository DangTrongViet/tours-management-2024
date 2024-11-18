import { Request, Response } from "express";
import Tour from "../../models/tour.model";



export const index = async (req: Request, res: Response) => {

    res.render("client/pages/cart/index", {
        pageTitle: "Giỏ hàng",

    });
}


export const checkout = async (req: Request, res: Response) => {

    const cart  = req.body.cart;
    let tourDetail = [];

    for (const item of cart) {
        const tourId = item.tourId;

        const tour = await Tour.findOne({
            raw: true,
            where: {
                id: tourId,
                deleted: false,
                status: "active" 
            }
        });
        tour["quantity"] = item.quantity;
        tourDetail.push(tour);
    }
    
    
    res.json({
        code: 200,
        message: "Thành công",
        data: tourDetail
    });
}

