import { Router } from "express";

import * as controller from '../../controllers/client/user.controller';
import * as validateUser from "../../validates/client/user.validate";
import * as authMiddleware from "../../middlewares/client/auth.middleware";

const router: Router = Router();


router.get("/register",controller.index);

router.post("/register",validateUser.registerPost,controller.register);

router.get("/login",controller.login);

router.post("/login",validateUser.loginPost,controller.loginPost);



router.get("/password/forgot",controller.forgotPassword);
router.post("/password/forgot",validateUser.forgotPasswordPost,controller.forgotPasswordPost);

router.get("/logout",controller.logout);


router.get("/password/otp",controller.otpPassword);
router.post("/password/otp",controller.otpPasswordPost);


router.get("/password/reset",controller.resetPassword);
router.post("/password/reset",validateUser.resetPasswordPost,controller.resetPasswordPost);



router.get("/info",authMiddleware.requireAuth,controller.info);


export const userRoute: Router = router;
