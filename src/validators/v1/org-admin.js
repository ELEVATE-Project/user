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
	inheritEntityType: (req) => {
		// Validate incoming request body
		req.checkBody('entity_type_value').notEmpty().withMessage('entity_type_value field is empty')
		req.checkBody('target_entity_type_label').notEmpty().withMessage('target_entity_type_label field is empty')
	}
}
