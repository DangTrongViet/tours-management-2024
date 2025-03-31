import { DataTypes } from "sequelize";
import sequelize from "../config/database"; 

const Order = sequelize.define("order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        allowNull: false,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    },
    fullName: {
        type: DataTypes.STRING(50),
        allowNull: false, 
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false, 
    },
    phone: {
        type: DataTypes.STRING(10),
        allowNull: false, 
    },
    note: {
        type: DataTypes.STRING(500), 
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending', 
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
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
    tableName: 'orders',
    timestamps: true, 
    hooks: {
        beforeCreate: (instance) => {
            // Ensure that the instance id is set before creating the code
            instance["code"] = `ORD00${instance["id"]}`;
        },
        beforeUpdate: (instance) => {
            if (instance["id"]) {
                instance["code"] = `ORD00${instance["id"]}`;
            }
        },
    }
});

export default Order;
