/**
 * name : validators/v1/accounts.js
 * author : Aman Gupta
 * Date : 20-Oct-2021
 * Description : Validations of accounts controller
 */
const common = require('@constants/common')
const filterRequestBody = require('../common')
const { account } = require('@constants/blacklistConfig')

const emailArrayValidation = (emailIds) => {
	if (!Array.isArray(emailIds)) {
		throw new Error('Email must be an array')
	}
	if (emailIds.length === 0) {
		throw new Error('Email array is empty')
	}
	emailIds.forEach((email) => {
		if (!email || typeof email !== 'string') {
			throw new Error('email must be a string')
		}
		const emailRegex =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		if (!emailRegex.test(email)) {
			throw new Error(`Invalid email format: ${email}`)
		}
	})
	return true
}

module.exports = {
	create: (req) => {
		if (!req || typeof req !== 'object') {
			throw new Error('Request object is undefined or invalid')
		}
		console.log(req.body)
		req.body = filterRequestBody(req.body, account.create)

		// Validate name
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('This field can only contain alphabets')

		// Validate email (optional)
		req.checkBody('email')
			.optional()
			.trim()
			.isEmail()
			.matches(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
			.withMessage('email is invalid')
			.normalizeEmail({ gmail_remove_dots: false })

		// Validate phone (optional)
		req.checkBody('phone')
			.optional()
			.trim()
			.matches(/^[0-9]{7,15}$/)
			.withMessage('phone must be a valid number between 7 and 15 digits')

		// Validate phone_code (required if phone is provided)
		req.checkBody('phone_code')
			.optional()
			.trim()
			.matches(/^\+[1-9][0-9]{0,3}$/)
			.withMessage('phone_code must be a valid country code (e.g., +1, +91)')

		// Validate password
		req.checkBody('password')
			.notEmpty()
			.withMessage('Password field is empty')
			.matches(process.env.PASSWORD_POLICY_REGEX)
			.withMessage(process.env.PASSWORD_POLICY_MESSAGE)
			.custom((value) => !/\s/.test(value))
			.withMessage('Password cannot contain spaces')

		// Validate role if provided
		if (req.body.role) {
			req.checkBody('role').trim().not().isIn([common.ADMIN_ROLE]).withMessage("User doesn't have admin access")
		}

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
		req.body = filterRequestBody(req.body, account.login)

		// Validate identifier
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

		return req
	},

	logout: (req) => {
		req.body = filterRequestBody(req.body, account.logout)
		req.checkBody('refresh_token').notEmpty().withMessage('refresh_token field is empty')
	},

	generateToken: (req) => {
		req.body = filterRequestBody(req.body, account.generateToken)
		req.checkBody('refresh_token').notEmpty().withMessage('refresh_token field is empty')
	},

	generateOtp: (req) => {
		req.body = filterRequestBody(req.body, account.generateOtp)
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
		req.checkBody('password').trim().notEmpty().withMessage('password field is empty')
	},

	registrationOtp: (req) => {
		req.body = filterRequestBody(req.body, account.registrationOtp)
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
		req.checkBody('name').notEmpty().withMessage('name field is empty')
	},

	resetPassword: (req) => {
		req.body = filterRequestBody(req.body, account.resetPassword)
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
		req.checkBody('password')
			.notEmpty()
			.withMessage('Password field is empty')
			.matches(process.env.PASSWORD_POLICY_REGEX)
			.withMessage(process.env.PASSWORD_POLICY_MESSAGE)
			.custom((value) => !/\s/.test(value))
			.withMessage('Password cannot contain spaces')

		req.checkBody('otp')
			.notEmpty()
			.withMessage('otp field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('otp should be number')
			.isLength({ min: 6, max: 6 })
			.withMessage('otp is invalid')
	},

	changeRole: (req) => {
		req.body = filterRequestBody(req.body, account.changeRole)
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
		req.checkBody('role').notEmpty().withMessage('role field is empty')
	},

	listUser: (req) => {
		req.checkQuery('type').notEmpty().withMessage('type can not be null').isString()
	},

	search: (req) => {
		req.checkQuery('type')
			.notEmpty()
			.withMessage('type can not be null')
			.isString()
			.notIn([common.ADMIN_ROLE, common.MENTEE_ROLE, common.MENTEE_ROLE, common.ORG_ADMIN_ROLE, common.TYPE_ALL])
			.withMessage('Invalid type value')
		req.checkQuery('organization_id').isNumeric().withMessage('organization_id must be an Id')
		req.checkBody('user_ids')
			.isArray()
			.withMessage('user_ids must be an array')
			.custom((value) => {
				// Check if all elements in the array are integers
				for (const id of value) {
					if (!Number.isInteger(id)) {
						throw new Error('All elements in user_ids must be integers')
					}
				}
				return true
			})
		req.checkBody('excluded_user_ids')
			.isArray()
			.withMessage('excluded_user_ids must be an array')
			.custom((value) => {
				// Check if all elements in the array are integers
				for (const id of value) {
					if (!Number.isInteger(id)) {
						throw new Error('All elements in excluded_user_ids must be integers')
					}
				}
				return true
			})
	},

	changePassword: (req) => {
		req.checkBody('oldPassword').notEmpty().withMessage('Password field is empty')

		req.checkBody('newPassword')
			.notEmpty()
			.withMessage('Password field is empty')
			.matches(process.env.PASSWORD_POLICY_REGEX)
			.withMessage(process.env.PASSWORD_POLICY_MESSAGE)
			.custom((value) => !/\s/.test(value))
			.withMessage('Password cannot contain spaces')
	},

	validatingEmailIds: (req) => {
		req.checkBody('emailIds').notEmpty().withMessage('emailIds field is empty').custom(emailArrayValidation)
	},
}
