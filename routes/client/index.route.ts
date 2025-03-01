import { Express} from "express";
import { categoryRoute } from "./category.route";
import { tourRoute } from "./tour.route";
import { cartRoute } from "./cart.route";
import { userRoute } from "./user.route";
import * as middlewareUser from "../../middlewares/client/user.middleware";
import { homeRoute } from "./home.route";
import { checkoutRoute } from "./checkout.route";
import { searchRoute } from "./search.route";
const clientRoutes = (app: Express): void => {
    
    app.use(middlewareUser.infoUser);
    app.use("/", homeRoute);
    app.use("/tours", tourRoute);
    app.use("/categories", categoryRoute);
    app.use("/cart",cartRoute);
    app.use("/user", userRoute);
    app.use("/checkout", checkoutRoute);
    app.use("/search",searchRoute);
};

export default clientRoutes;