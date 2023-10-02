/**
 * name : org-admin.js
 * author : Priyanka Pradeep
 * created-date : 15-Sep-2023
 * Description : User org admin
 */

// Dependencies
const orgAdminHelper = require('@services/helper/org-admin')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utilsHelper = require('@generics/utils')
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
			let isOrgAdmin = false
			if (req.decodedToken.roles && req.decodedToken.roles.length > 0) {
				isOrgAdmin = utilsHelper.validateRoleAccess(req.decodedToken.roles, common.roleOrgAdmin)
			}

			if (!isOrgAdmin) {
				throw common.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const userUploadRes = await orgAdminHelper.bulkUserCreate(req.body.file_path, req.decodedToken)
			return userUploadRes
		} catch (error) {
			return error
		}
	}

	/**
	 * List of uploaded invitee file
	 * @method
	 * @name getBulkInvitesFilesList
	 * @param {String} req.body.file_path -Uploaded file path .
	 * @returns {Object} - uploaded file response.
	 */
	async getBulkInvitesFilesList(req) {
		try {
			let isOrgAdmin = false
			if (req.decodedToken.roles && req.decodedToken.roles.length > 0) {
				isOrgAdmin = utilsHelper.validateRoleAccess(req.decodedToken.roles, common.roleOrgAdmin)
			}

			if (!isOrgAdmin) {
				throw common.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const fileUploadList = await orgAdminHelper.getBulkInvitesFilesList(req)
			return fileUploadList
		} catch (error) {
			return error
		}
	}

	/**
	 * Get role request details
	 * @method
	 * @name getRequestDetails
	 * @param {string} req.params.id- Role request id
	 * @returns {Object} - uploaded file response.
	 */
	async getRequestDetails(req) {
		try {
			let isOrgAdmin = false
			if (req.decodedToken.roles && req.decodedToken.roles.length > 0) {
				isOrgAdmin = utilsHelper.validateRoleAccess(req.decodedToken.roles, common.roleOrgAdmin)
			}

			if (!isOrgAdmin) {
				throw common.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const requestDetails = await orgAdminHelper.getRequestDetails(
				req.params.id,
				req.decodedToken.organization_id
			)
			return requestDetails
		} catch (error) {
			return error
		}
	}
}
