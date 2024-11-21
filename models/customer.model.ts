import { DataTypes } from "sequelize";
import sequelize from "../config/database"; 

const Customer = sequelize.define("customer", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        allowNull: false,
        primaryKey: true
    },
    fullName: {
        type: DataTypes.STRING(255),
        allowNull: false, 
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false, 
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false, 
        unique: true, 
    },
    note: {
        type: DataTypes.STRING(255), 
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'active', 
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    deletedAt: {
        type: DataTypes.DATE, 
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
       
    },
}, {
    tableName: 'customers',
    timestamps: true, 
});

export default Customer;
