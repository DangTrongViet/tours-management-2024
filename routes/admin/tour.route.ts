import { Router } from "express";

import * as controller from "../../controllers/admin/tour.controller"

const router: Router = Router();

router.get("/", controller.index);

router.put("/:slug", controller.updateTour);

router.post("/", controller.addTour);
export const tourRoute: Router = router;
