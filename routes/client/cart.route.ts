import { Router } from "express";

import * as controller from '../../controllers/client/cart.controller';

const router: Router = Router();


router.get("/",controller.index);

router.post("/",controller.checkout);


export const cartRoute: Router = router;