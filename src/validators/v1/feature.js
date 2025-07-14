/**
 * name : feature.js
 * author : Priyanka Pradeep
 * created-date : 09-Jun-2025
 * Description : Feature validator
 */

const filterRequestBody = require('../common')
const { feature } = require('@constants/blacklistConfig')
module.exports = {
	update: (req) => {
		const isUpdate = !!req.params.id
		const operation = isUpdate ? feature.update : feature.create
		req.body = filterRequestBody(req.body, operation)
		req.checkBody('label')
			.trim()
			.matches(/^[A-Za-z]*$/)
			.notEmpty()
			.withMessage('label field is empty')

		if (isUpdate && req.body.display_order !== undefined) {
			req.checkBody('display_order').matches(/^\d+$/).withMessage('display_order must contain only digits')
		}

		if (!isUpdate) {
			req.checkBody('code').trim().notEmpty().withMessage('code field is empty')
			req.checkBody('display_order')
				.notEmpty()
				.withMessage('display_order must not be empty')
				.matches(/^\d+$/)
				.withMessage('display_order must contain only digits')
		}
	},

	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
