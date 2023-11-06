'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('mentor_extensions', 'org_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.renameColumn('mentor_extensions', 'organisation_ids', 'visible_to_organizations'),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('mentor_extensions', 'org_id'),
      queryInterface.renameColumn('mentor_extensions', 'visible_to_organizations', 'organisation_ids'),
    ]);
  },
};
