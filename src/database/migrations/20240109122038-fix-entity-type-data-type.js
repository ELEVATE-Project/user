'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.sequelize.query(`
            UPDATE "entity_types"
            SET "data_type" = 'ARRAY[STRING]'
            WHERE "value" = 'languages';
          `)
		} catch (error) {
			console.error('Error during migration:', error.message)
		}
	},

	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.sequelize.query(`
            UPDATE "entity_types"
            SET "data_type" = 'STRING'
            WHERE "value" = 'languages';
          `)
		} catch (error) {
			console.error('Error during migration:', error.message)
		}
	},
}
