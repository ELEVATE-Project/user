'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		let roleData = []
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		let eachRow = {
			title: 'system_manager',
			user_type: 1,
			visibility: 'PUBLIC',
			organization_id: defaultOrgId,
			updated_at: new Date(),
			created_at: new Date(),
		}

		roleData.push(eachRow)
		await queryInterface.bulkInsert('user_roles', roleData, {})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('user_roles', { title: 'system_manager' })
	},
}
