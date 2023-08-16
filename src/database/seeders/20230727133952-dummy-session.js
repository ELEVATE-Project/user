const utils = require('../../generics/utils')
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const startDate = ['2023-01-16T03:45:39', '2023-01-16T05:45:39']
		const endDate = ['2023-01-16T06:45:39', '2023-01-16T07:45:39']
		let userData = []
		for (let i = 1; i <= 10; i++) {
			let defaultUser = {
				title: 'Like' + i,
				description: 'ok',
				recommended_for: ['beo'],
				categories: ['SQAA'],
				medium: ['English'],
				mentor_id: Math.floor(Math.random() * (10 - 6 + 1) + 6),
				status: 'completed',
				start_date: startDate[Math.floor(Math.random() * startDate.length)],
				end_date: endDate[Math.floor(Math.random() * endDate.length)],
				mentee_password: utils.hash('password'),
				mentor_password: utils.hash('password'),
				is_feedback_skipped: true,
				mentee_feedback_question_set: 'menteeQS1',
				mentor_feedback_question_set: 'mentorQS2',
				visibility: 'true',
				session_reschedule: 0,
				time_zone: 'Asia/Calcutta',
				updated_at: new Date(),
				created_at: new Date(),
				image: [
					'https://www.unigreet.com/wp-content/uploads/2022/11/100-very-special-good-morning-images-quotes-photos.jpg',
				],
				seats_remaining: 25,
				seats_limit: 25,
			}
			userData.push(defaultUser)
		}

		await queryInterface.bulkInsert('sessions', userData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('sessions', null, {})
	},
}
