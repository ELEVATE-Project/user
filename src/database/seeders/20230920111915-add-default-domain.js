'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		let domainData = []

		const defaultOrg = await queryInterface.sequelize.query('SELECT * FROM organizations where code= ? ', {
			replacements: ['sl'],
			type: queryInterface.sequelize.QueryTypes.SELECT,
		})

		let eachRow = {
			organization_id: defaultOrg[0].id,
			domain: 'shikshalokam.org',
			status: 'ACTIVE',
			updated_at: new Date(),
			created_at: new Date(),
		}

		domainData.push(eachRow)
		await queryInterface.bulkInsert('org_domains', domainData, {})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('org_domains', null, {})
	},
}
