import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            flash(messageType: string, message: string): void;
            flash(messageType: string): void;
        }
    }
}


export const registerPost = (req: Request, res: Response, next: NextFunction) => {

    if (!req.body.fullName) {
        req.flash("error", "Vui lòng nhập Họ tên!");
        res.redirect(req.get('Referrer') || '/');
        return;
    }
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập Email!");
        res.redirect(req.get('Referrer') || '/');
        return;
    }
    if (!req.body.phone) {
        req.flash("error", "Vui lòng nhập Số điện thoại!");
        res.redirect(req.get('Referrer') || '/');
        return;
    }
    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập Mật khẩu")
        res.redirect(req.get('Referrer') || '/');
        return;
    }
    next();
}


export const loginPost = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập Email!");
        res.redirect(req.get('Referrer') || '/');
        return;
    }
    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập Mật khẩu")
        res.redirect(req.get('Referrer') || '/');
        return;
    }

    next();
}

export const forgotPasswordPost=(req: Request, res: Response, next: NextFunction)=>{
    if(!req.body.email){
        req.flash("error","Vui lòng nhập Email!");
        res.redirect("back");
        return;
    }
    next();
}



export const resetPasswordPost=(req: Request, res: Response, next: NextFunction)=>{
    if(!req.body.password){
        req.flash("error","Vui lòng nhập mật khẩu!");
        res.redirect("back");
        return;
    }
    if(!req.body.confirmPassword){
        req.flash("error","Vui lòng nhập xác nhận mật khẩu!");
        res.redirect("back");
        return;
    }

    if(req.body.password != req.body.confirmPassword){
        req.flash("error","Mật khẩu không khớp!");
        res.redirect("back");
        return;
    }
    next();
}
