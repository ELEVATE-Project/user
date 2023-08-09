const utils = require('../../generics/utils')
module.exports = {
	up: async (queryInterface, Sequelize) => {
		let userData = []
		for (let i = 0; i < 5; i++) {
			let defaultUser = {
				title: 'Like' + i,
				description: 'ok',
				recommended_for: ['beo'],
				categories: ['SQAA'],
				medium: ['English'],
				mentor_id: 2,
				status: 'completed',
				start_date: random('2023-01-16T03:45:39', '2023-01-17T03:45:39', '2023-01-18T03:45:39'),
				end_date: random('2023-01-16T05:45:39', '2023-01-17T05:45:39', '2023-01-18T05:45:39'),
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
