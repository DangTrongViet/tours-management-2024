import { Router } from "express";

import * as controller from '../../controllers/client/checkout.controller';

const router: Router = Router();


router.get("/success/:orderId", controller.success);

router.get("/paymentSuccess",controller.paymentSuccess);

router.post("/paymentSuccess",controller.paymentSuccessPost);

router.get("/refundMoneySuccess",controller.refundMoneySuccess);

router.post("/refundMoneySuccess",controller.refundMoneySuccessPost);



export const checkoutRoute: Router = router;