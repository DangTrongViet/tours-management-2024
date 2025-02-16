'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Thêm cột 'password' vào bảng 'customers'
    await queryInterface.changeColumn('customers', 'token', {
      type: Sequelize.STRING(21),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {

    // Xóa cột 'password' khỏi bảng 'customers'
    await queryInterface.removeColumn('customers', 'token');
  }
};
