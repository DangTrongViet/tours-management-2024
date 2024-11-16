import { Router } from "express";

import * as controller from '../../controllers/client/cart.controller';

const router: Router = Router();


router.get("/",controller.index);


export const cartRoute: Router = router;