const { random } = require('lodash')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		let userData = []
		const defaultUser = {
			mentee_id: Math.floor(Math.random() * (5 - 1 + 1) + 1),
			session_id: Math.floor(Math.random() * (10 - 1 + 1) + 1),
			time_zone: 'Asia/Calcutta',
			updated_at: new Date(),
			created_at: new Date(),
		}
		userData.push(defaultUser)

		await queryInterface.bulkInsert('session_attendees', userData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('session_attendees', null, {})
	},
}
