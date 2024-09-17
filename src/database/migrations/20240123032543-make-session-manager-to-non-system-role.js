'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const userRole = await queryInterface.sequelize.query(
			`SELECT * FROM user_roles WHERE title = :title AND organization_id = :organization_id LIMIT 1`,
			{
				replacements: {
					title: 'session_manager',
					organization_id: defaultOrgId,
				},
				type: Sequelize.QueryTypes.SELECT,
			}
		)

		if (userRole) {
			const update = await queryInterface.sequelize.query(
				`UPDATE user_roles SET user_type = :user_type WHERE title = :title AND organization_id = :organization_id`,
				{
					replacements: {
						title: 'session_manager',
						organization_id: defaultOrgId,
						user_type: 0,
					},
					type: Sequelize.QueryTypes.UPDATE,
				}
			)
			console.log(update, 'update')
		} else {
			console.log('role session manager not found')
		}
	},

	down: async (queryInterface, Sequelize) => {
		//not required
	},
}
