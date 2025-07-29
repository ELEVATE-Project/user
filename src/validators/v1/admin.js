/**
 * name : validators/v1/admin.js
 * author : Priyanka Pradeep
 * Date : 19-Jun-2023
 * Description : Validations of admin controller
 */

const filterRequestBody = require('../common')
const { admin } = require('@constants/blacklistConfig')
module.exports = {
	deleteUser: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	create: (req) => {
		req.body = filterRequestBody(req.body, admin.create)
		req.checkBody('secret_code').trim().notEmpty().withMessage('secret_code field is empty')
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('name is invalid')

		req.checkBody('email')
			.trim()
			.notEmpty()
			.withMessage('email field is empty')
			.isEmail()
			.withMessage('email is invalid')
			.normalizeEmail()

		req.checkBody('password')
			.notEmpty()
			.withMessage('Password field is empty')
			.matches(process.env.PASSWORD_POLICY_REGEX)
			.withMessage(process.env.PASSWORD_POLICY_MESSAGE)
			.custom((value) => !/\s/.test(value))
			.withMessage('Password cannot contain spaces')
	},

	login: (req) => {
		req.body = filterRequestBody(req.body, admin.login)
		req.checkBody('email')
			.trim()
			.notEmpty()
			.withMessage('email field is empty')
			.isEmail()
			.withMessage('email is invalid')
			.normalizeEmail({ gmail_remove_dots: false })

		req.checkBody('password').trim().notEmpty().withMessage('password field is empty')
	},

	addOrgAdmin: (req) => {
		req.body = filterRequestBody(req.body, admin.addOrgAdmin)

		// Validate organization_id
		req.checkBody('organization_id')
			.notEmpty()
			.withMessage('organization_id field is empty')
			.isNumeric()
			.withMessage('organization_id must be a number')

		// Validate that either identifier or user_id is present, but not both
		req.checkBody(['identifier', 'user_id']).custom(() => {
			const identifier = req.body.identifier
			const user_id = req.body.user_id

			if (!identifier && !user_id) {
				throw new Error('Either identifier or user_id is required')
			}

			if (identifier && user_id) {
				throw new Error('Only one of identifier or user_id should be present')
			}

			return true
		})

		// Validate identifier (if present)
		req.checkBody('identifier').optional().isString().withMessage('identifier must be a string')

		// Validate user_id (if present)
		req.checkBody('user_id').optional().isNumeric().withMessage('user_id must be a number')

		// Validate phone_code (optional, but if present, should be valid)
		req.checkBody('phone_code')
			.optional()
			.matches(/^\+\d{1,3}$/)
			.withMessage('phone_code must be a valid country code (e.g., +91)')

		// Validate tenant_id in header
		req.checkHeaders('tenant-id')
			.notEmpty()
			.withMessage('tenant-id header is required')
			.isString()
			.withMessage('tenant-id must be a string')
	},

	deactivateUser: (req) => {
		req.body = filterRequestBody(req.body, admin.deactivateUser)
		const field = req.body.email ? 'email' : req.body.id ? 'id' : null
		if (field) {
			req.checkBody(field).isArray().notEmpty().withMessage(` ${field} must be an array and should not be empty.`)
		}
	},
}
