'use strict'

module.exports = {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.addColumn('organisation_extension', 'created_by', {
				type: Sequelize.INTEGER,
				allowNull: true,
			}),
			queryInterface.addColumn('organisation_extension', 'updated_by', {
				type: Sequelize.INTEGER,
				allowNull: true,
			}),
		])
	},

	down: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.removeColumn('organisation_extension', 'created_by'),
			queryInterface.removeColumn('organisation_extension', 'updated_by'),
		])
	},
}
