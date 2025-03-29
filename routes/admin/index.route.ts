import { Express } from "express";
import * as systemConfig from "../../config/system";
import { accountRoute } from "./account.route";
import { tourRoute } from "./tour.route";
import { voucherRoute } from "./voucher.route";
import { categoryRoute } from "./category.route";

const adminRoutes = (app: Express): void => {

    app.use(`${systemConfig.prefixAdmin}/tours`, tourRoute );
    app.use(`${systemConfig.prefixAdmin}/vouchers`,voucherRoute )
    app.use(`${systemConfig.prefixAdmin}/customers`, accountRoute)
    app.use(`${systemConfig.prefixAdmin}/categories`, categoryRoute);
};

export default adminRoutes;
