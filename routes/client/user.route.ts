import { Router } from "express";

import * as controller from "../../controllers/client/user.controller"

const router: Router = Router();

router.post("/register", controller.register);
router.post("/login",controller.login);
router.get("/info", controller.info);
router.put("/editInfo",controller.editInfo);

router.get("/tourBookingHistory", controller.tourBookingHistory)
router.get("/payment", controller.payment);
router.put("/cancelTour", controller.cancelTour);
router.put("/paymentPost", controller.paymentPost);
router.get("/paymentSuccess", controller.paymentSuccess);
router.put("/refundMoney", controller.refundMoney);
export const userRoute: Router = router;
