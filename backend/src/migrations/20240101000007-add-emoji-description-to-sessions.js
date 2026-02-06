'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sessions', 'emoji', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: '💬'
    });

    await queryInterface.addColumn('sessions', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sessions', 'emoji');
    await queryInterface.removeColumn('sessions', 'description');
  }
};
