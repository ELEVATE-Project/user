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

		if (isUpdate && req.body.sequence_no !== undefined) {
			req.checkBody('sequence_no').matches(/^\d+$/).withMessage('sequence_no must contain only digits')
		}

		if (!isUpdate) {
			req.checkBody('code').trim().notEmpty().withMessage('code field is empty')
			req.checkBody('sequence_no')
				.notEmpty()
				.withMessage('sequence_no must not be empty')
				.matches(/^\d+$/)
				.withMessage('sequence_no must contain only digits')
		}
	},

	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
