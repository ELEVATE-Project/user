'use strict'

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('org_domains', 'domain', {
			type: Sequelize.STRING,
			unique: true,
		})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('org_domains', 'domain', {
			type: Sequelize.STRING,
			unique: false,
		})
	},
}
