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
		if (!isUpdate) {
			req.checkBody('code').trim().notEmpty().withMessage('code field is empty')
		}
	},

	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
