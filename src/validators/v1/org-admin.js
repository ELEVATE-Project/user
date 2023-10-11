/**
 * name : validators/v1/admin.js
 * author : Priyanka Pradeep
 * Date : 19-Jun-2023
 * Description : Validations of admin controller
 */

module.exports = {
	bulkUserCreate: (req) => {
		req.checkBody('file_path').notEmpty().withMessage('file_path field is empty')
	},
	getRequestDetails: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
	updateRequestStatus: (req) => {
		req.checkBody('request_id').notEmpty().withMessage('request_id field is empty')
		req.checkBody('status').notEmpty().withMessage('status field is empty')
	},
	deactivateUser: (req) => {
		const field = req.body.email ? 'email' : req.body.id ? 'id' : null
		if (field) {
			req.checkBody('id').isArray().notEmpty().withMessage(` ${field} must be an array and should not be empty.`)
		}
	},
}
