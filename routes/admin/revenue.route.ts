import { Router } from "express";

import * as controller from "../../controllers/admin/revenue.controller"

const router: Router = Router();

router.get("/", controller.revenue);

export const revenueRoute: Router = router;
