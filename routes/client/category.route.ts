import { Router } from "express";

import * as controller from "../../controllers/client/category.controller"
const router: Router = Router();


router.get("/",controller.getCategories);


export const categoryRoute: Router = router;