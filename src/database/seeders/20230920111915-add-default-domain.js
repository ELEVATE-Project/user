'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		let domainData = []
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		let eachRow = {
			organization_id: defaultOrgId,
			domain: 'default.org',
			status: 'ACTIVE',
			updated_at: new Date(),
			created_at: new Date(),
		}

		domainData.push(eachRow)
		await queryInterface.bulkInsert('organization_domains', domainData, {})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('organization_domains', null, {})
	},
}
