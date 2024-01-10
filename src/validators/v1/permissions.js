module.exports = {
	create: (req) => {
		req.checkBody('code')
			.trim()
			.notEmpty()
			.withMessage('code field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('code is invalid, must not contain spaces')

		req.checkBody('module')
			.trim()
			.notEmpty()
			.withMessage('module field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('module is invalid, must not contain spaces')

		const allowedActions = ['ALL', 'READ', 'WRITE', 'UPDATE', 'DELETE']
		req.checkBody('actions')
			.trim()
			.notEmpty()
			.withMessage('actions field is empty')
			.isIn(allowedActions)
			.withMessage(`actions is invalid, must be one of: ${allowedActions.join(',')}`)

		req.checkBody('status')
			.trim()
			.matches(/^[A-Za-z]*$/)
			.withMessage('status is invalid, must not contain spaces')
			.optional({ checkFalsy: true })
			.notEmpty()
			.withMessage('status field must be a non-empty string when provided')
	},

	update: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')

		req.checkBody('code')
			.trim()
			.notEmpty()
			.withMessage('code field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('code is invalid, must not contain spaces')

		req.checkBody('module')
			.trim()
			.notEmpty()
			.withMessage('module field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('module is invalid, must not contain spaces')

		const allowedActions = ['ALL', 'READ', 'WRITE', 'UPDATE', 'DELETE']
		req.checkBody('actions')
			.trim()
			.notEmpty()
			.withMessage('actions field is empty')
			.isIn(allowedActions)
			.withMessage(`actions is invalid, must be one of: ${allowedActions.join(',')}`)

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
}
