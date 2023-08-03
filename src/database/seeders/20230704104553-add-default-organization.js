

module.exports = {
	up: async (queryInterface, Sequelize) => {
		let orgData = []
		const defaultOrg = {
			name: 'Shikshalokam',
			code: 'sl',
			description: 'Founded in 2017, ShikshaLokam is an Education Leadership Catalyst under the aegis of Advaith Foundation.',
			status: 'active',
			updated_at: new Date(),
			created_at: new Date(),
		}
		orgData.push(defaultOrg)

		await queryInterface.bulkInsert('organizations', orgData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('organizations', null, {})
	},
}
