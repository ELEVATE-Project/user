/**
 * name : validators/v1/users.js
 * author : Priyanka Pradeep
 * Date : 17-July-2023
 * Description : Validations of user controller
 */

module.exports = {
	update: (req) => {
		if (req.body.preferred_language) {
			req.checkBody('preferred_language')
				.trim()
				.isIn(['en', 'hi'])
				.withMessage('Language is invalid, must be either en or hi')
		} else {
			req.checkBody('gender')
				.trim()
				.optional()
				.isIn(['MALE', 'FEMALE', 'OTHER'])
				.withMessage('gender is invalid, must be either MALE, FEMALE or OTHER')

			req.checkBody('name').trim().notEmpty().withMessage('name field is empty')

			req.checkBody('location')
				.notEmpty()
				.withMessage('location field is empty')
				.isArray()
				.withMessage('location is invalid')

			req.checkBody('about').trim().notEmpty().withMessage('about field is empty')

			req.checkBody('has_accepted_terms_and_conditions')
				.optional()
				.isBoolean()
				.withMessage('has_accepted_terms_and_conditions field is invalid')

			req.checkBody('image').optional().isString().withMessage('image field must be string only')
		}
	},

	read: (req) => {},

	share: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
