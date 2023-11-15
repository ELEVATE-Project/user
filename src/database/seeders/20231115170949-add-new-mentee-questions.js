const questionModel = require('../queries/questions')
const _ = require('lodash')
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			let questionsFinalArray = []
			const questionsNames = [
				'session_relevents_to_role',
				'mentee_thought_sharing_comfort',
				'mentee_learning_extent',
			]
			const questionsArray = [
				{
					name: 'session_relevents_to_role',
					question: 'How relevant was the session to your role?',
				},
				{
					name: 'mentee_thought_sharing_comfort',
					question: 'To what extent did you feel comfortable sharing your thoughts in the session?',
				},
				{
					name: 'mentee_learning_extent',
					question: 'To what extent were you able to learn new skill or concept in the session?',
				},
			]

			//get mentee question set
			const getQuestionSet = await queryInterface.sequelize.query(
				'SELECT * FROM question_sets WHERE code = :questionSetCode LIMIT 1',
				{
					replacements: { questionSetCode: 'MENTEE_QS1' },
					type: queryInterface.sequelize.QueryTypes.SELECT,
					raw: true,
				}
			)

			if (getQuestionSet.length > 0) {
				const questionSetId = getQuestionSet[0].id

				const additionalObject = {
					question_set_id: questionSetId,
					status: 'PUBLISHED',
					type: 'rating',
					no_of_stars: 5,
					rendering_data: {
						validators: {
							required: false,
						},
						disable: false,
						visible: true,
						class: 'ion-margin',
					},
					updated_at: new Date(),
					created_at: new Date(),
				}

				questionsFinalArray = questionsArray.map((question) => ({ ...question, ...additionalObject }))
				questionsFinalArray.forEach((question) => {
					question.rendering_data = JSON.stringify(question.rendering_data)
				})

				//INSERT QUESTIONS
				await queryInterface.bulkInsert('questions', questionsFinalArray, {})

				//get questions
				const getQuestions = await queryInterface.sequelize.query(
					'SELECT id FROM questions WHERE name IN (:questionNames)',
					{
						replacements: { questionNames: questionsNames },
						type: queryInterface.sequelize.QueryTypes.SELECT,
						raw: true,
					}
				)

				if (getQuestions.length > 0) {
					let questionIds = getQuestions.map((obj) => obj.id.toString())

					const updateQuestionsIds = _.union(getQuestionSet[0].questions || [], questionIds)

					const updatedValues = {
						questions: updateQuestionsIds,
					}

					const updateCondition = { code: 'MENTEE_QS1' }

					//update question set
					await queryInterface.bulkUpdate('question_sets', updatedValues, updateCondition, {})
				}
			}
		} catch (error) {
			console.log(error)
		}
	},

	down: async (queryInterface, Sequelize) => {},
}
