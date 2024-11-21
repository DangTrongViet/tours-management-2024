import { DataTypes } from "sequelize";
import sequelize from "../config/database"; 

const Booking = sequelize.define("booking", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        allowNull: false,
        primaryKey: true
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tourId: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    booking_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending', 
    },
    note: {
        type: DataTypes.TEXT, 
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
    tableName: 'bookings',
    timestamps: true, 
});

export default Booking;
