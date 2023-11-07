'use strict'

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('org_domains', 'domain', {
			type: Sequelize.INTEGER,
			unique: true,
		})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('org_domains', 'domain', {
			type: Sequelize.INTEGER,
			unique: false,
		})
	},
}
