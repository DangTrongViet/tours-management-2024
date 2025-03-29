import { Router } from "express";

import * as controller from "../../controllers/admin/voucher.controller"

const router: Router = Router();

router.get("/", controller.index);



export const voucherRoute: Router = router;
