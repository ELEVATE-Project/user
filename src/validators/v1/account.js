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
		req.body = filterRequestBody(req.body, account.create)
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('This field can only contain alphabets')

		req.checkBody('email')
			.trim()
			.notEmpty()
			.withMessage('email field is empty')
			.isEmail()
			.matches(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
			.withMessage('email is invalid')
			.normalizeEmail({ gmail_remove_dots: false })

		req.checkBody('password')
			.notEmpty()
			.withMessage('Password field is empty')
			.matches(process.env.PASSWORD_POLICY_REGEX)
			.withMessage(process.env.PASSWORD_POLICY_MESSAGE)
			.custom((value) => !/\s/.test(value))
			.withMessage('Password cannot contain spaces')

		if (req.body.role) {
			req.checkBody('role').trim().not().isIn([common.ADMIN_ROLE]).withMessage("User does't have admin access")
		}
	},

	login: (req) => {
		req.body = filterRequestBody(req.body, account.login)
		req.checkBody('email')
			.trim()
			.notEmpty()
			.withMessage('email field is empty')
			.isEmail()
			.withMessage('email is invalid')
			.normalizeEmail({ gmail_remove_dots: false })

		req.checkBody('password').trim().notEmpty().withMessage('password field is empty')
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
