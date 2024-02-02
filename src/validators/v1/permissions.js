const Permission = require('@database/models/index').Permission

async function isUniqueCode(value) {
	const existingRecord = await Permission.findOne({ where: { code: value } })
	if (existingRecord) {
		throw new Error('Code must be unique')
	}
	return true
}

module.exports = {
	create: (req) => {
		req.checkBody('code')
			.trim()
			.notEmpty()
			.withMessage('Code field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('Code is invalid, must not contain spaces')
			.custom(isUniqueCode)

		req.checkBody('module')
			.trim()
			.notEmpty()
			.withMessage('Module field is empty')
			.matches(/^[a-zA-Z_-]+$/)
			.withMessage('Module is invalid, must not contain spaces')

		const allowedRequestType = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
		req.checkBody('request_type')
			.trim()
			.notEmpty()
			.withMessage('request_type field is empty')
			.isIn(allowedRequestType)
			.withMessage(`request_type is invalid, must be one of: ${allowedRequestType.join(',')}`)

		req.checkBody('api_path')
			.trim()
			.matches(/^\/[a-zA-Z0-9_]+\/v[0-9]+\/[a-zA-Z0-9_*:/\-]+(?:\/:[a-zA-Z0-9_]+)?$/)
			.withMessage('API Path is invalid')

		req.checkBody('status')
			.trim()
			.matches(/^[A-Za-z]*$/)
			.withMessage('Status is invalid, must not contain spaces')
			.optional({ checkFalsy: true })
			.notEmpty()
			.withMessage('Status field must be a non-empty string when provided')
	},

	update: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')

		req.checkBody('code')
			.trim()
			.notEmpty()
			.withMessage('Code field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('Code is invalid, must not contain spaces')

		req.checkBody('module')
			.trim()
			.notEmpty()
			.withMessage('Module field is empty')
			.matches(/^[a-zA-Z_-]+$/)
			.withMessage('Module is invalid, must not contain spaces')

		const allowedRequestType = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
		req.checkBody('request_type')
			.trim()
			.notEmpty()
			.withMessage('request_type field is empty')
			.isIn(allowedRequestType)
			.withMessage(`request_type is invalid, must be one of: ${allowedRequestType.join(',')}`)

		req.checkBody('api_path')
			.trim()
			.matches(/^\/[a-zA-Z0-9_]+\/v[0-9]+\/[a-zA-Z0-9_*:/\-]+(?:\/:[a-zA-Z0-9_]+)?$/)
			.withMessage('API Path is invalid')

		req.checkBody('status')
			.trim()
			.matches(/^[A-Za-z]*$/)
			.withMessage('Status is invalid, must not contain spaces')
			.optional({ checkFalsy: true })
			.notEmpty()
			.withMessage('Status field must be a non-empty string when provided')
	},

	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
