/**
 * name : validators/v1/admin.js
 * author : Priyanka Pradeep
 * Date : 25-July-2023
 * Description : Validations of Organization controller
 */
const filterRequestBody = require('../common')
const { organization } = require('@constants/blacklistConfig')
module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, organization.create)
		req.checkBody('code').trim().notEmpty().withMessage('code field is empty')
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('name is invalid')

		req.checkBody('description')
			.trim()
			.notEmpty()
			.withMessage('description field is empty')
			.matches(/(\b)(on\S+)(\s*)=|javascript:|<(|\/|[^\/>][^>]+|\/[^>][^>]+)>/gi)
			.withMessage('invalid description')
		req.checkBody('domains').trim().notEmpty().withMessage('domains field is empty')
	},

	update: (req) => {
		req.body = filterRequestBody(req.body, organization.update)
		req.checkParams('id').notEmpty().withMessage('id param is empty')
		req.checkBody('name')
			.optional()
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('name is invalid')

		req.checkBody('description')
			.optional()
			.trim()
			.notEmpty()
			.withMessage('description field is empty')
			.matches(/(\b)(on\S+)(\s*)=|javascript:|<(|\/|[^\/>][^>]+|\/[^>][^>]+)>/gi)
			.withMessage('invalid description')
	},

	requestOrgRole: (req) => {
		req.body = filterRequestBody(req.body, organization.requestOrgRole)
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
