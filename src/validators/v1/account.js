/**
 * name : validators/v1/accounts.js
 * author : Aman Gupta
 * Date : 20-Oct-2021
 * Description : Validations of accounts controller
 */
const common = require('@constants/common')
module.exports = {
	create: (req) => {
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

		req.checkBody('password').trim().notEmpty().withMessage('password field is empty')

		if (req.body.role) {
			req.checkBody('role').trim().not().isIn([common.ADMIN_ROLE]).withMessage("User does't have admin access")
		}
	},

	login: (req) => {
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
		req.checkBody('refresh_token').notEmpty().withMessage('refresh_token field is empty')
	},

	generateToken: (req) => {
		req.checkBody('refresh_token').notEmpty().withMessage('refresh_token field is empty')
	},

	generateOtp: (req) => {
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
		req.checkBody('password').trim().notEmpty().withMessage('password field is empty')
	},

	registrationOtp: (req) => {
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
		req.checkBody('name').notEmpty().withMessage('name field is empty')
	},

	resetPassword: (req) => {
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
		req.checkBody('password').notEmpty().withMessage('password field is empty')

		req.checkBody('otp')
			.notEmpty()
			.withMessage('otp field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('otp should be number')
			.isLength({ min: 6, max: 6 })
			.withMessage('otp is invalid')
	},

	changeRole: (req) => {
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
		req.checkBody('role').notEmpty().withMessage('role field is empty')
	},

	listUser: (req) => {
		req.checkQuery('type').notEmpty().withMessage('type can not be null').isString()
	},
}
