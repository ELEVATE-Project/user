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
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('This field can only contain alphabets')
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
	profileById: (req) => {
		// id (numeric only)
		req.checkParams('id')
			.optional()
			.trim()
			.matches(/^[0-9]+$/)
			.withMessage('id is invalid. Must be numeric')

		// email
		req.checkQuery('email')
			.optional()
			.trim()
			.isEmail()
			.withMessage('email is invalid. Must be a valid email format')
		// username
		req.checkQuery('username')
			.optional()
			.trim()
			.matches(/^(?:[a-z0-9_-]{3,40}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})$/) //accept random string (min 3 max 40) of smaller case letters _ - and numbers OR email in lowercase as username
			.withMessage('username is invalid')
		// phone
		req.checkQuery('phone')
			.optional()
			.trim()
			.matches(/^[0-9]{7,15}$/)
			.withMessage('phone is invalid. Must be digits only, length 7–15')

		// phone_code
		req.checkQuery('phone_code')
			.optional()
			.trim()
			.matches(/^\+[0-9]{1,4}$/)
			.withMessage('phone_code is invalid. Must start with + and contain 1–4 digits')

		// tenant_code
		req.checkQuery('tenant_code')
			.trim()
			.matches(/^[A-Za-z0-9_-]+$/)
			.withMessage('tenant_code is invalid. Only letters, numbers, underscore, and hyphen allowed')

		if (!req.params.id) {
			req.checkQuery(['email', 'username', 'phone', 'phone_code']).custom(() => {
				const { email, username, phone, phone_code } = req.query

				if (!email && !username && !phone) {
					throw new Error('At least one of id, email, username, or phone must be provided')
				}

				if (phone && !phone_code) {
					throw new Error('phone_code is required when phone is provided')
				}

				return true
			})
		}
	},
}
