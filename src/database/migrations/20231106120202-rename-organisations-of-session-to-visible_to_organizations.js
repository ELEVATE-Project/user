'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('sessions', 'organization_ids', 'visible_to_organizations');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('sessions', 'visible_to_organizations', 'organization_ids');
  },
};
