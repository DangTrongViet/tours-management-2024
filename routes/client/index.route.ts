import { Express} from "express";
import { categoryRoute } from "./category.route";
import { tourRoute } from "./tour.route";
import { cartRoute } from "./cart.route";

const clientRoutes = (app: Express): void => {
    
    app.use("/tours", tourRoute);
    app.use("/categories", categoryRoute);
    app.use("/cart",cartRoute);
};

export default clientRoutes;