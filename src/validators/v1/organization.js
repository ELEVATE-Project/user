/**
 * name : validators/v1/admin.js
 * author : Priyanka Pradeep
 * Date : 25-July-2023
 * Description : Validations of Organization controller
 */

module.exports = {
	create: (req) => {
		req.checkBody('code').trim().notEmpty().withMessage('code field is empty')
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('name is invalid')

		req.checkBody('description').trim().notEmpty().withMessage('description field is empty')
	},

	update: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	requestOrgRole: (req) => {
		req.checkBody('role').notEmpty().withMessage('role field is empty')
		req.checkBody('form_data').notEmpty().withMessage('form_data field is empty')
	},
}
