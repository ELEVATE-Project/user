/**
 * name : validators/v1/users.js
 * author : Priyanka Pradeep
 * Date : 17-July-2023
 * Description : Validations of user controller
 */
const filterRequestBody = require('../common')
const { user } = require('@constants/blacklistConfig')
module.exports = {
	update: (req) => {
		req.checkBody('gender')
			.trim()
			.optional()
			.isIn(['MALE', 'FEMALE', 'OTHER'])
			.withMessage('gender is invalid, must be either MALE, FEMALE or OTHER')

		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('This field can only contain alphabets')

		req.checkBody('location')
			.notEmpty()
			.withMessage('location field is empty')
			.isString()
			.withMessage('location is invalid')

		req.checkBody('about')
			.trim()
			.notEmpty()
			.withMessage('about field is empty')
			.matches(/^[a-zA-Z0-9\-.,\s]+$/)
			.withMessage('invalid about')

		req.checkBody('has_accepted_terms_and_conditions')
			.optional()
			.isBoolean()
			.withMessage('has_accepted_terms_and_conditions field is invalid')

		req.checkBody('languages').optional().isArray().withMessage('languages is invalid')

		req.checkBody('image').optional().isString().withMessage('image field must be string only')
	},

	share: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	setLanguagePreference: (req) => {
		req.checkBody('preferred_language')
			.trim()
			.notEmpty()
			.withMessage('preferred_language field is empty')
			.isString()
			.withMessage('preferred_language must be string')
	},
}
