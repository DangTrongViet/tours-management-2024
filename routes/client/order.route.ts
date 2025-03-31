import { Router } from "express";

import * as controller from "../../controllers/client/order.controller"

const router: Router = Router();

router.post("/", controller.order);


export const orderRoute: Router = router;
