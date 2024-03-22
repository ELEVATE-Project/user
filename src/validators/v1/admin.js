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
		req.checkBody('organization_id').notEmpty().withMessage('organization_id field is empty')

		req.checkBody(['user_id', 'email']).custom(() => {
			const user_id = req.body.user_id
			const email = req.body.email

			if (!user_id && !email) {
				throw new Error('Either user_id or email is required')
			}

			if (user_id && email) {
				throw new Error('Only one of user_id or email should be present')
			}

			return true
		})
		req.checkBody('user_id').optional().isNumeric().withMessage('user_id must be a number')

		req.checkBody('email').optional().isEmail().withMessage('Invalid email address')
	},

	deactivateUser: (req) => {
		req.body = filterRequestBody(req.body, admin.deactivateUser)
		const field = req.body.email ? 'email' : req.body.id ? 'id' : null
		if (field) {
			req.checkBody(field).isArray().notEmpty().withMessage(` ${field} must be an array and should not be empty.`)
		}
	},
}
