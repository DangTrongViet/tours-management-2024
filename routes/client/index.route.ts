import { Express } from "express";
import { categoryRoute } from "./category.route";

const clientRoutes = (app: Express): void => {
   
    app.use("/categories", categoryRoute);
};

export default clientRoutes;
