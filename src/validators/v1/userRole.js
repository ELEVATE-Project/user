module.exports = {
	create: (req) => {
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

		req.checkBody('organization_id')
			.notEmpty()
			.withMessage('organization_id field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('organization_id should be number')

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

		req.checkBody('organization_id')
			.notEmpty()
			.withMessage('organization_id field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('organization_id should be number')

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
