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
}
