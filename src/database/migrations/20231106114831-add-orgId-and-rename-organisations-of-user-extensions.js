'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('user_extensions', 'org_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.renameColumn('user_extensions', 'organisation_ids', 'visible_to_organizations'),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('user_extensions', 'org_id'),
      queryInterface.renameColumn('user_extensions', 'visible_to_organizations', 'organisation_ids'),
    ]);
  },
};
