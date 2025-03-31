import { Router } from "express";

import * as controller from "../../controllers/client/user.controller"

const router: Router = Router();

router.post("/register", controller.register);
router.get("/login",controller.login);
router.get("/user/info", controller.info);
export const userRoute: Router = router;
