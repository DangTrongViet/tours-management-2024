import Customer from "../../models/customer.model";
import { Request, Response, NextFunction } from "express";


export const requireAuth= async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.tokenUser){
        const token = req.cookies.tokenUser;
       
        const user =await Customer.findOne({
            raw: true,
            attributes: { exclude: ["password"]},
            where: {
                token: token,
                deleted: false,
                status: "active"
            }
        });
        
        if(!user){
            res.json({
                code: 400,
                message: "Token không hợp lệ"
            });
        }
        res.locals.user = user ;
    } else {
        res.redirect("/user/login");
    }

    next();

}