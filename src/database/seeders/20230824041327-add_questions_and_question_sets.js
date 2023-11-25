const questionModel = require('../queries/questions')
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
			if (!defaultOrgId) {
				throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
			}
			let questionSetFinalArray = []

			const questionsArray = {
				MENTOR_QS2: [
					{
						name: 'mentor_engagement_in_session',
						question: 'How would you rate the engagement in the session?',
						type: 'rating',
						no_of_stars: 5,
						status: 'PUBLISHED',
						rendering_data: {
							validators: {
								required: false,
							},
							disable: false,
							visible: true,
							class: 'ion-margin',
						},
					},
					{
						name: 'mentor_audio_video_quality',
						question: 'How would you rate the Audio/Video quality?',
						type: 'rating',
						no_of_stars: 5,
						status: 'PUBLISHED',
						rendering_data: {
							validators: {
								required: false,
							},
							disable: false,
							visible: true,
							class: 'ion-margin',
						},
					},
				],
				MENTEE_QS1: [
					{
						name: 'rating_host',
						question: 'How would you rate the host of the session?',
						type: 'rating',
						no_of_stars: 5,
						status: 'PUBLISHED',
						category: {
							evaluating: 'mentor',
						},
						rendering_data: {
							validators: {
								required: false,
							},
							disable: false,
							visible: true,
							class: 'ion-margin',
						},
					},
					{
						name: 'mentee_engagement_in_session',
						question: 'How would you rate the engagement in the session?',
						type: 'rating',
						no_of_stars: 5,
						status: 'PUBLISHED',
						rendering_data: {
							validators: {
								required: false,
							},
							disable: false,
							visible: true,
							class: 'ion-margin',
						},
					},
					{
						name: 'mentor_audio_video_quality',
						question: 'How would you rate the Audio/Video quality?',
						type: 'rating',
						no_of_stars: 5,
						status: 'PUBLISHED',
						rendering_data: {
							validators: {
								required: false,
							},
							disable: false,
							visible: true,
							class: 'ion-margin',
						},
					},
				],
			}

			Object.keys(questionsArray).forEach((key) => {
				let questionSetRow = {
					code: key,
					status: 'PUBLISHED',
					updated_at: new Date(),
					created_at: new Date(),
					organization_id: defaultOrgId,
				}

				questionSetFinalArray.push(questionSetRow)
			})

			let menteeQuestions = []
			let mentorQuestions = []

			Object.keys(questionsArray).forEach((questionSet) => {
				questionsArray[questionSet].forEach((question) => {
					question.created_at = new Date()
					question.updated_at = new Date()

					question.rendering_data = JSON.stringify(question.rendering_data)
					if (question.category) {
						question.category = JSON.stringify(question.category)
					}
					if (questionSet == 'MENTOR_QS2') {
						mentorQuestions.push(question)
					} else {
						menteeQuestions.push(question)
					}
				})
			})

			//INSERT MENTOR QUESTIONS
			await queryInterface.bulkInsert('questions', mentorQuestions, {})

			const mentor_questions = await queryInterface.sequelize.query(
				'SELECT * FROM questions ORDER BY created_at DESC LIMIT ' + mentorQuestions.length,
				{
					type: queryInterface.sequelize.QueryTypes.SELECT,
				}
			)

			let mentorQuestionIds = mentor_questions.map((obj) => obj.id)
			questionSetFinalArray = questionSetFinalArray.map((eachSet) => {
				if (eachSet.code === 'MENTOR_QS2') {
					eachSet.questions = mentorQuestionIds
				}
				return eachSet
			})

			//INSERT MENTEE QUESTIONS
			await queryInterface.bulkInsert('questions', menteeQuestions, {})

			const mentee_questions = await queryInterface.sequelize.query(
				'SELECT * FROM questions ORDER BY created_at DESC LIMIT ' +
					menteeQuestions.length +
					' OFFSET ' +
					mentorQuestionIds.length,
				{
					type: queryInterface.sequelize.QueryTypes.SELECT,
				}
			)

			let menteeQuestionIds = mentee_questions.map((obj) => obj.id)
			questionSetFinalArray = questionSetFinalArray.map((eachSet) => {
				if (eachSet.code != 'MENTOR_QS2') {
					eachSet.questions = menteeQuestionIds
				}
				return eachSet
			})

			//INSERT QUESTION SETS
			await queryInterface.bulkInsert('question_sets', questionSetFinalArray, {})
		} catch (error) {
			console.log(error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('question_sets', null, {})
		await queryInterface.bulkDelete('questions', null, {})
	},
}
