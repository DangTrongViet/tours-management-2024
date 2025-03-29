import { Express } from "express";

import { accountRoute } from "./account.route";
import { tourRoute } from "./tour.route";
import { voucherRoute } from "./voucher.route";

const adminRoutes = (app: Express): void => {

    app.use("/tours", tourRoute );
    app.use("/vouchers",voucherRoute )
    app.use("/customers", accountRoute)
};

export default adminRoutes;
