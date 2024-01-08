'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

		await queryInterface.bulkInsert(
			'user_roles',
			[
				{
					title: 'session_manager',
					user_type: 1,
					visibility: 'PUBLIC',
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
			],
			{}
		)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('user_roles', { title: 'session_manager' })
	},
}
