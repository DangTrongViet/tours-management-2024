import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Voucher = sequelize.define("voucherss", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // Tự động tăng id,
        allowNull: false,
        primaryKey: true
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    expire: {
        type: DataTypes.DATE,
        allowNull: false
    },
    minAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Đặt giá trị mặc định là false
    },
    deletedAt: {
        type: DataTypes.DATE
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'vouchers',
    timestamps: true // Tự động quản lý createAt, updateAt
});

export default Voucher;