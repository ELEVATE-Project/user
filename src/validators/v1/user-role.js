const filterRequestBody = require('../common')
const { userRole } = require('@constants/blacklistConfig')
const common = require('@constants/common')
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
			.withMessage('title is required')
			.matches(/^[a-z_]+$/)
			.withMessage('title must contain only lowercase letters (a–z) and underscores')

		req.checkBody('user_type')
			.trim()
			.notEmpty()
			.withMessage('user_type is required')
			.isIn(['0', '1'])
			.withMessage('user_type must be 0 (non-admin) or 1 (admin)')

		req.checkBody('visibility')
			.trim()
			.notEmpty()
			.withMessage('visibility is required')
			.isIn(['PUBLIC'])
			.withMessage('visibility must be PUBLIC')

		req.checkBody('label')
			.trim()
			.notEmpty()
			.withMessage('label is required')
			.matches(/^[A-Z][a-zA-Z\s]*$/)
			.withMessage('label must start with an uppercase letter and contain only letters and spaces')
			.isLength({ max: 50 })
			.withMessage('label must be at most 50 characters')

		req.checkBody('status')
			.optional({ checkFalsy: true })
			.trim()
			.isIn([common.ACTIVE_STATUS, common.INACTIVE_STATUS])
			.withMessage(`status must be either ${common.ACTIVE_STATUS} or ${common.INACTIVE_STATUS} when provided`)
	},

	update: (req) => {
		req.body = filterRequestBody(req.body, userRole.update)

		req.checkParams('id').notEmpty().withMessage('id param is required')

		req.checkBody('title')
			.trim()
			.notEmpty()
			.withMessage('title is required')
			.matches(/^[a-z_]+$/)
			.withMessage('title must contain only lowercase letters (a–z) and underscores')

		req.checkBody('user_type')
			.trim()
			.notEmpty()
			.withMessage('user_type is required')
			.isIn(['0', '1'])
			.withMessage('user_type must be 0 (non-admin) or 1 (admin)')

		req.checkBody('visibility')
			.trim()
			.notEmpty()
			.withMessage('visibility is required')
			.isIn(['PUBLIC'])
			.withMessage('visibility must be PUBLIC')

		req.checkBody('status')
			.trim()
			.optional({ checkFalsy: true })
			.isIn([common.ACTIVE_STATUS, common.INACTIVE_STATUS])
			.withMessage(`status must be either ${common.ACTIVE_STATUS} or ${common.INACTIVE_STATUS} when provided`)

		req.checkBody('label')
			.trim()
			.optional()
			.matches(/^[A-Z][a-zA-Z\s]*$/)
			.withMessage('label must start with an uppercase letter and contain only letters and spaces')
			.isLength({ max: 50 })
			.withMessage('label must be at most 50 characters')
	},
	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	list: (req) => {
		req.checkQuery('title')
			.optional()
			.trim()
			.matches(/^[a-z_]+$/)
			.withMessage('title is invalid. Use only lowercase letters a–z and underscores')

		req.checkQuery('user_type')
			.optional()
			.trim()
			.isIn(['0', '1'])
			.withMessage('user_type is invalid. Allowed values: 0 (non-admin) or 1 (admin)')

		req.checkQuery('visibility')
			.optional()
			.trim()
			.isIn(['PUBLIC'])
			.withMessage('visibility is invalid. Allowed value: PUBLIC')

		req.checkQuery('status')
			.optional()
			.trim()
			.isIn([common.ACTIVE_STATUS, common.INACTIVE_STATUS])
			.withMessage(`status must be either ${common.ACTIVE_STATUS} or ${common.INACTIVE_STATUS} when provided`)

		req.checkQuery('organization_id')
			.optional()
			.trim()
			.matches(/^[0-9]+$/)
			.withMessage('organization_id is invalid. Must be numeric')
	},
}
