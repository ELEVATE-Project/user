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
		req.checkBody('domains').trim().notEmpty().withMessage('domains field is empty')
	},

	update: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	requestOrgRole: (req) => {
		req.checkBody('role').notEmpty().withMessage('role field is empty')
		req.checkBody('form_data').notEmpty().withMessage('form_data field is empty')
	},

	read: (req) => {
		req.checkQuery('organisation_id').optional().notEmpty().withMessage('organisation_id field is empty')

		req.checkQuery('organisation_code').optional().notEmpty().withMessage('organisation_code field is empty')

		// Use oneOf to check that at least one of the fields is present
		req.checkQuery()
			.oneOf(['organisation_id', 'organisation_code'])
			.withMessage('At least one of organisation_id or organisation_code should be present')
	},
}
