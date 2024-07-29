'use strict'
require('module-alias/register')
require('dotenv').config()
const materializedViewsService = require('@generics/materializedViews')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			// drop view to remove dependency
			await queryInterface.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS m_users;`)

			await queryInterface.removeColumn('users', 'gender')

			//recreate the view
			await materializedViewsService.checkAndCreateMaterializedViews()
		} catch (error) {
			console.log(error)
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.addColumn('users', 'gender', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},
}
