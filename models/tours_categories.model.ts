import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const toursCategories = sequelize.define("tours_categories", {
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    
}, {
    tableName: 'tours_categories',
});

export default toursCategories;