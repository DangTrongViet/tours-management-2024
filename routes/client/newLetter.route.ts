import { Router } from "express";

import * as controller from "../../controllers/client/newLetter.controller"

const router: Router = Router();


router.get("/",controller.index);


export const newLetterRoute: Router = router;