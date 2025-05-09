'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		let roleData = []
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		let eachRow = {
			title: 'org_admin',
			user_type: 1,
			updated_at: new Date(),
			created_at: new Date(),
			organization_id: process.env.DEFAULT_ORG_ID,
			tenant_code: process.env.DEFAULT_TENANT_CODE,
		}

		roleData.push(eachRow)
		await queryInterface.bulkInsert('user_roles', roleData, {})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('user_roles', { title: 'org_admin' })
	},
}
