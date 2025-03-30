import { Router } from "express";

import * as controller from "../../controllers/admin/category.controller"

const router: Router = Router();

router.get("/", controller.index);

router.put("/:slug",controller.updateCategory);

router.post("/", controller.addCategory);

export const categoryRoute: Router = router;
