/**
 * name : validators/v1/admin.js
 * author : Priyanka Pradeep
 * Date : 19-Jun-2023
 * Description : Validations of admin controller
 */

module.exports = {
	deleteUser: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	create: (req) => {
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

		req.checkBody('password').trim().notEmpty().withMessage('password field is empty')
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

	addOrgAdmin: (req) => {
		req.checkBody('user_id').notEmpty().withMessage('user_id field is empty')
		req.checkBody('org_id').notEmpty().withMessage('org_id field is empty')
	},
	deactivateUser: (req) => {
		const field = req.body.email ? 'email' : req.body.id ? 'id' : null
		if (field) {
			req.checkBody(field).isArray().notEmpty().withMessage(` ${field} must be an array and should not be empty.`)
		}
	},
}
