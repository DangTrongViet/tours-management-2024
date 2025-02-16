import { DataTypes } from "sequelize";
import sequelize from "../config/database"; 

const forgotPassword = sequelize.define("customer", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false, 
    },
    otp: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    expire: {
        type: DataTypes.DATE,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'forgot_password',
    timestamps: false, 
});

export default forgotPassword;
