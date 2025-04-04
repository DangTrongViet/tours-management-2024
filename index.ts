import express, { Express} from "express";
import sequelize from "./config/database";
import dotenv from 'dotenv';
import moment from "moment";
import clientRoutes from "./routes/client/index.route";
import cors from "cors";
import flash from "express-flash";
import cookieParser from "cookie-parser";
import session from "express-session";
import adminRoutes from "./routes/admin/index.route";
import * as systemConfig from "./config/system";
import clientBeRoutes from "./routes/client/index.route";
dotenv.config();

sequelize;

const app: Express = express();
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// Flash
app.use(cookieParser("keyboard cat"));
app.use(session(
    {
        cookie: { maxAge: 60000 }
    }
));
app.use(flash());

app.set("views", "./views");
app.set("view engine", "pug");

// App Local Varilables
app.locals.moment = moment;
app.locals.prefixAdmin=systemConfig.prefixAdmin;
// Client Routes
clientRoutes(app);
adminRoutes(app);

app.listen(port, '0.0.0.0', () => {
    console.log(`App listening on port ${port}`);
});