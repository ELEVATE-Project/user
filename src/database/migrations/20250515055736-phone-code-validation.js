'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS m_users`)
			await queryInterface.changeColumn('users', 'phone_code', {
				type: Sequelize.STRING(4),
				allowNull: true,
				validate: {
					len: {
						args: [2, 4],
						msg: 'Phone code must be between 2 and 4 characters',
					},
				},
			})
		} catch (error) {
			console.log('Error while updating phone code : ', error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('users', 'phone_code', {
			type: Sequelize.STRING(6),
			allowNull: true,
		})
	},
}
