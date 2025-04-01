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
        unique: true // Ensure the code is unique
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
        // This hook is called after the order is created, and id is available at this point
        afterCreate: async (order) => {
            // Set the code after the order is created and id is assigned
            const code = `ORD00${order["id"]}`; // Construct code based on id
            await order.update({ code: code })
        }
    }
});

export default Order;
