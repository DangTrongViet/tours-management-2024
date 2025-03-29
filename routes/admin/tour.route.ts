import { Router } from "express";

import * as controller from "../../controllers/admin/tour.controller"

const router: Router = Router();

router.get("/", controller.index);



export const tourRoute: Router = router;
