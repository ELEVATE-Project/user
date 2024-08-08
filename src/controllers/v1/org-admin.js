/**
 * name : org-admin.js
 * author : Priyanka Pradeep
 * created-date : 15-Sep-2023
 * Description : User org admin
 */

// Dependencies
const orgAdminService = require('@services/org-admin')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utilsHelper = require('@generics/utils')
const responses = require('@helpers/responses')
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
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ORG_ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const userUploadRes = await orgAdminService.bulkUserCreate(req.body.file_path, req.decodedToken)
			return userUploadRes
		} catch (error) {
			return error
		}
	}

	/**
	 * Get a list of uploaded bulk invite CSV files.
	 * @method
	 * @name getBulkInvitesFilesList
	 * @param {Object} req - request data with method GET.
	 * @param {Number} req.pageNo - page no.
	 * @param {Number} req.pageSize - page size limit.
	 * @param {String} req.status - status.
	 * @returns {JSON} - list of uploaded CSV files.
	 */
	async getBulkInvitesFilesList(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ORG_ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const fileUploadList = await orgAdminService.getBulkInvitesFilesList(req) // TODO: Request Object shouldn't be allowed to leave controller layer.
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
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ORG_ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const requestDetails = await orgAdminService.getRequestDetails(
				req.params.id,
				req.decodedToken.organization_id
			)
			return requestDetails
		} catch (error) {
			return error
		}
	}

	/**
	 * Get a list of organization requests based on specified filters.
	 * @method
	 * @name getRequests
	 * @param {Object} req - request data with method GET.
	 * @param {Number} req.pageNo - page no.
	 * @param {Number} req.pageSize - page size limit.
	 * @returns {JSON} - list of role change requests.
	 */
	async getRequests(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ORG_ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const result = await orgAdminService.getRequests(req)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Update Request Status
	 * @method
	 * @name updateRequestStatus
	 * @param {Object} req - request data with method POST.
	 * @param {string} req.body.request_id -request id.
	 * @param {string} req.body.comments - comments.
	 * @param {string} req.body.status - status.
	 * @returns {JSON} - Response of request status change.
	 */
	async updateRequestStatus(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ORG_ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const result = await orgAdminService.updateRequestStatus(req.body, req.decodedToken)
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * Deactivate User
	 * @method
	 * @name deactivateUser
	 * @param {String} req.params.id - user Id.
	 * @returns {JSON} - deactivated user response
	 */
	async deactivateUser(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ORG_ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (!req.body.id && !req.body.email) {
				throw responses.failureResponse({
					message: 'EMAIL_OR_ID_REQUIRED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const result = await orgAdminService.deactivateUser(req.body, req.decodedToken)

			return result
		} catch (error) {
			return error
		}
	}

	/**
	 * @description			- Inherit entity type.
	 * @method				- post
	 * @name 				- inheritEntityType
	 * @returns {JSON} 		- Inherited entity type details.
	 */

	async inheritEntityType(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ORG_ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let entityTypeDetails = orgAdminService.inheritEntityType(
				req.body.entity_type_value,
				req.body.target_entity_type_label,
				req.decodedToken.organization_id,
				req.decodedToken.id
			)
			return entityTypeDetails
		} catch (error) {
			return error
		}
	}

	/**
	 * @description						- Update user role
	 * @method 							- post
	 * @name 							- updateUser
	 * @returns {Json}					- returns message with status whether user has been updated or not
	 */

	async updateUser(req) {
		try {
			let updateUserDetails = await orgAdminService.updateUser(req.params.id, req.body, req.decodedToken)
			return updateUserDetails
		} catch (error) {
			return error
		}
	}
}
