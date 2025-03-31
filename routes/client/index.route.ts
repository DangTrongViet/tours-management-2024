import { Express } from "express";
import { categoryRoute } from "./category.route";
import { tourRoute } from "./tour.route";
import { voucherRoute } from "./voucher.route";
import { userRoute } from "./user.route";

const clientRoutes = (app: Express): void => {
   
    app.use("/categories", categoryRoute);
    app.use("/tours", tourRoute);
    app.use("/vouchers", voucherRoute);
    app.use("/user",userRoute);
};

export default clientRoutes;
