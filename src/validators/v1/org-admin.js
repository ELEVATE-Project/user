/**
 * name : validators/v1/admin.js
 * author : Priyanka Pradeep
 * Date : 19-Jun-2023
 * Description : Validations of admin controller
 */
const filterRequestBody = require('../common')
const common = require('@constants/common')
const { orgAdmin } = require('@constants/blacklistConfig')

module.exports = {
	bulkUserCreate: (req) => {
		const upload_type = [common.TYPE_INVITE, common.TYPE_UPLOAD]
		req.body = filterRequestBody(req.body, orgAdmin.bulkUserCreate)
		req.checkBody('file_path').notEmpty().withMessage('file_path field is empty')
		req.checkBody('upload_type')
			.notEmpty()
			.withMessage('upload_type is required')
			.isIn(upload_type)
			.withMessage(`upload_type must be from : ${upload_type.join(',')}`)
	},
	getRequestDetails: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
	updateRequestStatus: (req) => {
		req.body = filterRequestBody(req.body, orgAdmin.updateRequestStatus)
		req.checkBody('request_id').notEmpty().withMessage('request_id field is empty')
		req.checkBody('status').notEmpty().withMessage('status field is empty')
	},
	deactivateUser: (req) => {
		const field = req.body.email ? 'email' : req.body.id ? 'id' : null
		if (field) {
			req.checkBody(field).isArray().notEmpty().withMessage(` ${field} must be an array and should not be empty.`)
		}
	},
	inheritEntityType: (req) => {
		// Validate incoming request body
		req.checkBody('entity_type_value').notEmpty().withMessage('entity_type_value field is empty')
		req.checkBody('target_entity_type_label').notEmpty().withMessage('target_entity_type_label field is empty')
	},
}
