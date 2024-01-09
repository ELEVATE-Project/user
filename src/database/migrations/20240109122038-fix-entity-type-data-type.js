'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query(`
          UPDATE "entity_types"
          SET "data_type" = 'ARRAY[STRING]'
          WHERE "value" = 'languages';
        `)
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query(`
          UPDATE "entity_types"
          SET "data_type" = 'STRING'
          WHERE "value" = 'languages';
        `)
	},
}
