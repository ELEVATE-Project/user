/**
 * name : validators/v1/entity.js
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Validations of user entities controller
 */

module.exports = {
	update: (req) => {
		if (!req.params.id) {
			req.checkBody('title').trim().notEmpty().withMessage('title field is empty')

			req.checkBody('description').trim().notEmpty().withMessage('description field is empty')

			req.checkBody('start_date').notEmpty().withMessage('start_date field is empty')

			req.checkBody('end_date').notEmpty().withMessage('end_date field is empty')

			req.checkBody('recommended_for').notEmpty().withMessage('recommended_for field is empty')

			req.checkBody('categories').notEmpty().withMessage('categories field is empty')

			req.checkBody('medium').notEmpty().withMessage('medium field is empty')
		} else {
			req.checkBody('title').trim().optional().withMessage('title field is empty')

			req.checkBody('description').trim().optional().withMessage('description field is empty')
		}
	},
	details: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	enroll: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	unEnroll: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	share: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	updateRecordingUrl: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')

		req.checkBody('recordingUrl').notEmpty().withMessage('recordingUrl field is empty')
	},
	enrolledMentees: (req) => {
		req.checkParams('id')
			.notEmpty()
			.withMessage('id param is empty')
			.isNumeric()
			.withMessage('id param is invalid, must be an integer')

		req.checkQuery('csv').optional().isBoolean().withMessage('csv is invalid, must be a boolean value')
	},

	addMentees: (req) => {
		// throw error if sessionId is not passed
		req.checkParams('id').notEmpty().withMessage('id param is empty')
		// Check if req.body.menteeIds is an array and not empty
		req.checkBody('mentees')
			.custom((mentees) => Array.isArray(mentees) && mentees.length > 0)
			.withMessage('mentees must be a non-empty array')
	},

	removeMentees: (req) => {
		// throw error if sessionId is not passed
		req.checkParams('id').notEmpty().withMessage('id param is empty')
		// Check if req.body.menteeIds is an array and not empty
		req.checkBody('mentees')
			.custom((mentees) => Array.isArray(mentees) && mentees.length > 0)
			.withMessage('mentees must be a non-empty array')
	},
}
