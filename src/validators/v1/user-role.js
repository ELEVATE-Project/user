const filterRequestBody = require('../common')
const { userRole } = require('@constants/blacklistConfig')
const validateList = (req, allowedVariables) => {
	allowedVariables.forEach((variable) => {
		req.checkQuery(variable)
			.optional()
			.matches(/^[A-Za-z0-9_]+$/)
			.withMessage(`${variable} is invalid, must not contain spaces or special characters`)
	})
}

module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, userRole.create)
		req.checkBody('title')
			.trim()
			.notEmpty()
			.withMessage('title field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('title is invalid, must not contain spaces')

		req.checkBody('user_type')
			.trim()
			.notEmpty()
			.withMessage('userType field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('userType is invalid, must not contain spaces')

		req.checkBody('visibility')
			.trim()
			.notEmpty()
			.withMessage('visibility field is empty')
			.matches(/^[A-Z_]+$/)
			.withMessage('visibility is invalid, must not contain spaces')

		req.checkBody('label')
			.trim()
			.notEmpty()
			.withMessage('label field is empty')
			.matches(/^[A-Z][a-zA-Z\s]*$/)
			.withMessage('label is invalid, first letter must be capital')

		req.checkBody('status')
			.trim()
			.matches(/^[A-Za-z]*$/)
			.withMessage('status is invalid, must not contain spaces')
			.optional({ checkFalsy: true })
			.notEmpty()
			.withMessage('status field must be a non-empty string when provided')
	},

	update: (req) => {
		req.body = filterRequestBody(req.body, userRole.update)
		req.checkParams('id').notEmpty().withMessage('id param is empty')

		req.checkBody('title')
			.trim()
			.notEmpty()
			.withMessage('title field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('title is invalid, must not contain spaces')

		req.checkBody('user_type')
			.trim()
			.notEmpty()
			.withMessage('userType field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('userType is invalid, must not contain spaces')

		req.checkBody('visibility')
			.trim()
			.notEmpty()
			.withMessage('visibility field is empty')
			.matches(/^[A-Z_]+$/)
			.withMessage('visibility is invalid, must not contain spaces')

		req.checkBody('status')
			.trim()
			.matches(/^[A-Za-z]*$/)
			.withMessage('status is invalid, must not contain spaces')
			.optional({ checkFalsy: true })
			.notEmpty()
			.withMessage('status field must be a non-empty string when provided')
	},

	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	list: (req) => {
		const allowedVariables = ['title', 'user_type', 'visibility', 'organization_id', 'status']
		validateList(req, allowedVariables)
	},

	default: (req) => {
		const allowedVariables = ['title', 'user_type', 'visibility', 'organization_id', 'status']
		validateList(req, allowedVariables)
	},
}
