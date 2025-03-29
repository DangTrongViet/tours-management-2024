import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const orderItem = sequelize.define("orderItem", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // Tự động tăng id,
        allowNull: false,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tourId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
    },
    price: {
        type: DataTypes.INTEGER,
    },

    discount: {
        type: DataTypes.INTEGER
    },
    timeStart: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    paymentDate: {  
        type: DataTypes.DATE,
        allowNull: true  
    },
    refund_date: {  
        type: DataTypes.DATE,
        allowNull: true,  
    },
}, {
    tableName: 'orders_item',
    timestamps: false // Tự động quản lý createAt, updateAt
});

export default orderItem;