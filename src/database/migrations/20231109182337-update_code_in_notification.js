'use strict'

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('notification_templates', 'code', {
			type: Sequelize.STRING,
			unique: false,
		})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('notification_templates', 'code', {
			type: Sequelize.STRING,
			unique: true,
		})
	},
}
