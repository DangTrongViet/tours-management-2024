import { Router } from "express";

import * as controller from "../../controllers/admin/category.controller"

const router: Router = Router();

router.get("/", controller.index);



export const categoryRoute: Router = router;
