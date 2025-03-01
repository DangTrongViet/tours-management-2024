import { Router } from "express";

import * as controller from '../../controllers/client/search.controller';

const router: Router = Router();


router.get("/",controller.index);


export const searchRoute: Router = router;