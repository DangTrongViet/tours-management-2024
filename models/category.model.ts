import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Category = sequelize.define("category", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // Tự động tăng id,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    images: {
        type: DataTypes.STRING(500)
    },
    description: {
        type: DataTypes.TEXT('long')
    },
    status: {
        type: DataTypes.STRING(20),
    }, 
    position: {
        type: DataTypes.INTEGER
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Đặt giá trị mặc định là false
    },
    deletedAt: {
        type: DataTypes.DATE
    },
}, {
    tableName: 'categories',
    timestamps: true // Tự động quản lý createAt, updateAt
});

export default Category;