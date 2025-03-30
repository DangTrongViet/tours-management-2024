import { Router } from "express";

import * as controller from "../../controllers/admin/voucher.controller"

const router: Router = Router();

router.get("/", controller.index);

router.post("/", controller.addVoucher);

router.put("/:id", controller.updateVoucher);
export const voucherRoute: Router = router;
