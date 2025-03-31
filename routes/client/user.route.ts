import { Router } from "express";

import * as controller from "../../controllers/client/user.controller"

const router: Router = Router();

router.get("/", controller.index);
router.post("/register", controller.register);

export const userRoute: Router = router;
