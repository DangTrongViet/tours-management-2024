import { Router } from "express";

import * as controller from "../../controllers/client/user.controller"

const router: Router = Router();

router.post("/register", controller.register);
router.post("/login",controller.login);
router.get("/info", controller.info);
router.put("/editInfo",controller.editInfo);

router.get("/tourBookingHistory", controller.tourBookingHistory)
export const userRoute: Router = router;
