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
			.optional()
			.trim()
			.isEmail()
			.matches(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
			.withMessage('email is invalid')
			.normalizeEmail({ gmail_remove_dots: false })

		req.checkBody('username')
			.optional()
			.trim()
			.matches(/^(?:[a-z0-9_-]{3,40}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})$/) //accept random string (min 3 max 40) of smaller case letters _ - and numbers OR email in lowercase as username
			.withMessage('username is invalid')

		// Validate phone (optional)
		req.checkBody('phone')
			.optional()
			.trim()
			.matches(/^[0-9]{7,15}$/)
			.withMessage('phone must be a valid number between 7 and 15 digits')

		// Validate phone_code (required if phone is provided)
		req.checkBody('phone_code')
			.optional({ checkFalsy: true })
			.trim()
			.isLength({ min: 2, max: 4 }) // Length between 2 and 4 characters
			.withMessage('Phone code must be between 2 and 4 characters')

		// Validate password
		req.checkBody('password')
			.notEmpty()
			.withMessage('Password field is empty')
			.matches(process.env.PASSWORD_POLICY_REGEX)
			.withMessage(process.env.PASSWORD_POLICY_MESSAGE)
			.custom((value) => !/\s/.test(value))
			.withMessage('Password cannot contain spaces')

		req.checkBody(['email', 'phone', 'phone_code']).custom(() => {
			const phone = req.body.phone
			const phone_code = req.body.phone_code
			const email = req.body.email

			if (!email && !phone) {
				throw new Error('At least one of email or phone must be provided')
			}

			if (phone && !phone_code) {
				throw new Error('phone_code is required when phone is provided')
			}

			return true
		})
	},

	login: (req) => {
		req.body = filterRequestBody(req.body, admin.login)
		req.checkBody('identifier')
			.trim()
			.notEmpty()
			.withMessage('Identifier field is empty')
			.custom((value) => {
				// Check if the identifier is a valid email, phone, or username
				const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
				const isPhone = /^\d{6,15}$/.test(value) // Phone: 6-15 digits
				const isUsername = /^[a-zA-Z0-9-_]{3,30}$/.test(value)

				if (!isEmail && !isPhone && !isUsername) {
					throw new Error('Identifier must be a valid email, phone number, or username')
				}
				return true
			})
			.if(body('identifier').custom((value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)))
			.normalizeEmail({ gmail_remove_dots: false }) // Normalize email only if identifier is an email

		// Validate phone_code (required only if identifier is a phone number)
		req.checkBody('phone_code')
			.if(body('identifier').custom((value) => /^\d{6,15}$/.test(value))) // Apply only for phone identifiers
			.notEmpty()
			.withMessage('Phone code is required for phone number login')
			.matches(/^\+[1-9]\d{0,3}$/)
			.withMessage('Phone code must be a valid country code (e.g., +1, +91)')

		// Validate password
		req.checkBody('password').trim().notEmpty().withMessage('Password field is empty')
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
