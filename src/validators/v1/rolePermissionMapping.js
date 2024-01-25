module.exports = {
	create: (req) => {
		req.checkBody('permission_id')
			.trim()
			.notEmpty()
			.withMessage('permission_id field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('permission_id is invalid, must not contain spaces')

		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},

	delete: (req) => {
		req.checkBody('permission_id')
			.trim()
			.notEmpty()
			.withMessage('permission_id field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('permission_id is invalid, must not contain spaces')

		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
