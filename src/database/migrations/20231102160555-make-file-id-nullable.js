'use strict'

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('org_user_invites', 'file_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('org_user_invites', 'file_id', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},
}
