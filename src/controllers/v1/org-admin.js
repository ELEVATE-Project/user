/**
 * name : org-admin.js
 * author : Priyanka Pradeep
 * created-date : 15-Sep-2023
 * Description : User org admin
 */

// Dependencies
const csv = require('csvtojson')
const orgAdminHelper = require('@services/helper/org-admin')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class OrgAdmin {
	/**
	 * Bulk create mentor/mentee
	 * @method
	 * @name bulkUserCreate
	 * @param {String} req.body.file_path -Uploaded filr path .
	 * @returns {Object} - uploaded file response.
	 */
	async bulkUserCreate(req) {
		try {
			const userUploadRes = await orgAdminHelper.userBulkUpload(req.body.file_path, req.decodedToken)
			return userUploadRes
		} catch (error) {
			return error
		}
	}
}
