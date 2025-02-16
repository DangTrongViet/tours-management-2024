import express, { Express} from "express";
import sequelize from "./config/database";
import dotenv from 'dotenv';
import moment from "moment";
import clientRoutes from "./routes/client/index.route";
import cors from "cors";
import flash from "express-flash";
import cookieParser from "cookie-parser";
import session from "express-session";

dotenv.config();

sequelize;

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.use(cors());
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

// Client Routes
clientRoutes(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});