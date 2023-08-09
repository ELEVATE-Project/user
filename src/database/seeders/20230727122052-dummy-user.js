module.exports = {
	up: async (queryInterface, Sequelize) => {
		let userData = []
		const defaultUser = {
			user_id: 1,
			designation: 'Teacher',
			area_of_expertise: ['eduLdship'],
			education_qualification: ['BEd'],
			user_type: 'mentor',
			organisation_ids: [1],
			updated_at: new Date(),
			created_at: new Date(),
		}
		userData.push(defaultUser)

		await queryInterface.bulkInsert('user_extensions', userData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('user_extensions', null, {})
	},
}
