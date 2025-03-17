import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DATABASE_NAME || "tour_management_2024", // Tên databse
    process.env.DATABASE_USERNAME || "root", // Username đăng nhập
    process.env.DATABASE_PASSWORD, // Mật khẩu
    {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT) || 3306,
        dialect: 'mysql'
    }
);


sequelize.authenticate().then(() => {
   console.log('Connection Success!');
}).catch((error) => {
   console.error('Connect Error: ', error);
});

export default sequelize;