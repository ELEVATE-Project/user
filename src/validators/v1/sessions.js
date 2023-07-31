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

			req.checkBody('startDate').notEmpty().withMessage('startDate field is empty')

			req.checkBody('endDate').notEmpty().withMessage('endDate field is empty')

			req.checkBody('recommendedFor').notEmpty().withMessage('recommendedFor field is empty')

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
		req.checkParams('id').notEmpty().withMessage('id param is empty').isMongoId().withMessage('id is invalid')
	},

	unEnroll: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty').isMongoId().withMessage('id is invalid')
	},

	share: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	updateRecordingUrl: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')

		req.checkBody('recordingUrl').notEmpty().withMessage('recordingUrl field is empty')
	},
}
