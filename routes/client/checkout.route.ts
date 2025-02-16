import { Router } from "express";

import * as controller from '../../controllers/client/checkout.controller';

const router: Router = Router();


router.get("/success/:orderId", controller.success);



export const checkoutRoute: Router = router;