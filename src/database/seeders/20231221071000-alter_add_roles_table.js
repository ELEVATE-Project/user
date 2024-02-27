'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		const roleArray = ['user', 'mentor', 'mentee', 'admin', 'org_admin']

		// Use Promise.all to wait for all async operations in the loop
		await Promise.all(
			roleArray.map(async function (role) {
				let user_type = 0
				if (role === 'admin') {
					user_type = 1
				}

				// Use the queryInterface.bulkUpdate for each role
				await queryInterface.bulkUpdate(
					'user_roles',
					{
						visibility: 'PUBLIC',
						organization_id: defaultOrgId,
					},
					{
						title: role,
						user_type: user_type,
					}
				)
			})
		)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('user_roles', null, {})
	},
}
