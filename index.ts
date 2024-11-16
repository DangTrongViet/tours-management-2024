import express, { Express } from "express";
import sequelize from "./config/database";
import dotenv from 'dotenv';
import moment from "moment";
import clientRoutes from "./routes/client/index.route";

dotenv.config();

sequelize;

const app: Express = express();
const port: number | string = process.env.PORT || 3000 ;

app.use(express.static("public"));

app.set("views", "./views");
app.set("view engine", "pug");

// App Local Varilables
app.locals.moment = moment;

// Client Routes
clientRoutes(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});