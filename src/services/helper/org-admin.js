/**
 * name : services/helper/org-admin.js
 * author : Priyanka Pradeep
 * created-date : 15-Sep-2023
 * Description : Org Admin Service Helper.
 */

// Dependencies

const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utils = require('@generics/utils')
const _ = require('lodash')
const userQueries = require('@database/queries/users')
const roleQueries = require('@database/queries/userRole')
const fileUploadQueries = require('@database/queries/fileUpload')
const orgRoleReqQueries = require('@database/queries/orgRoleRequest')
const invitesQueue = require('@configs/queue')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')

module.exports = class OrgAdminHelper {
	/**
	 * Bulk create users
	 * @method
	 * @name bulkUserCreate
	 * @param {Array} users - user details.
	 * @param {Object} tokenInformation - token details.
	 * @returns {CSV} - created users.
	 */

	static async bulkUserCreate(filePath, tokenInformation) {
		try {
			const { id, email, organization_id } = tokenInformation

			const creationData = {
				name: utils.extractFilename(filePath),
				input_path: filePath,
				type: common.fileTypeCSV,
				organization_id,
				created_by: id,
			}
			const result = await fileUploadQueries.create(creationData)
			//push to queue
			await invitesQueue.add(
				{
					fileDetails: result,
					user: {
						id,
						email,
						organization_id,
					},
				},
				{
					attempts: 3, // Retry this job 5 times
					backoff: {
						type: 'fixed',
						delay: 600000, // Wait 10 min between attempts
					},
				}
			)
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_CSV_UPLOADED',
				result: result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * List of uploaded invitee file
	 * @method
	 * @name getBulkInvitesFilesList
	 * @param {Number} page - page No.
	 * @param {Number} limit - page limit.
	 * @param {String} status - status field.
	 * @returns {JSON} - List of file uploads
	 */
	static async getBulkInvitesFilesList(req) {
		try {
			let listFileUpload = await fileUploadQueries.listUploads(
				req.pageNo,
				req.pageSize,
				req.query.status ? req.query.status : null,
				req.decodedToken.organization_id
			)

			if (listFileUpload.count > 0) {
				await Promise.all(
					listFileUpload.data.map(async (upload) => {
						/* Assigned upload url from the stored location */
						upload.input_path = await utils.getDownloadableUrl(upload.input_path)
						if (upload.output_path) {
							upload.output_path = await utils.getDownloadableUrl(upload.output_path)
						}
						return upload
					})
				)
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FILE_UPLOAD_FETCHED',
				result: listFileUpload,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Get role request details
	 * @method
	 * @name getRequestDetails
	 * @param {Number} id - request id
	 * @returns {JSON} - Details of role request
	 */
	static async getRequestDetails(requestId, organization_id) {
		try {
			let requestDetails = await orgRoleReqQueries.requestDetails(
				{
					id: requestId,
					organization_id,
				},
				{
					attributes: {
						exclude: ['created_at', 'updated_at', 'deleted_at'],
					},
				}
			)

			if (!requestDetails.handler) {
				requestDetails.handler = {}
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_ROLE_REQ_FETCHED',
				result: requestDetails,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Get list of role change requests
	 * @method
	 * @name getRequests
	 * @param {Object} req - request data
	 * @returns {JSON} - List of role request
	 */
	static async getRequests(params) {
		try {
			let filterQuery = {
				organization_id: params.decodedToken.organization_id,
			}

			if (params.body?.filters) {
				for (const [key, value] of Object.entries(params.body.filters)) {
					filterQuery[key] = value
				}
			}

			const options = {
				attributes: {
					exclude: ['created_at', 'updated_at', 'deleted_at'],
				},
			}

			let requestList = await orgRoleReqQueries.listAllRequests(
				filterQuery,
				params.pageNo,
				params.pageSize,
				options
			)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_ROLE_REQ_LIST_FETCHED',
				result: requestList,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update Request Status
	 * @method
	 * @name updateRequestStatus
	 * @param {Object} req - request data
	 * @returns {JSON} - Response of request status change.
	 */
	static async updateRequestStatus(bodyData, loggedInUserId) {
		try {
			const id = bodyData.request_id
			delete bodyData.request_id
			bodyData.handled_by = loggedInUserId

			const rowsAffected = await orgRoleReqQueries.update({ id: id }, bodyData)
			if (rowsAffected == 0) {
				return common.failureResponse({
					message: 'ORG_ROLE_REQ_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const isAccepted = bodyData.status === common.statusAccepted
			const message = isAccepted ? 'ORG_ROLE_REQ_APPROVED' : 'ORG_ROLE_REQ_UPDATED'

			const result = await orgRoleReqQueries.requestDetails({ id })
			let roleArray = []

			const user = await userQueries.findByPk(result.requester_id)

			const userRoles = await roleQueries.findAll(
				{ id: user.roles, status: common.activeStatus },
				{ attributes: ['title', 'id', 'user_type', 'status'] }
			)

			const systemRoleIds = userRoles
				.filter((role) => role.user_type === common.roleTypeSystem)
				.map((role) => role.id)

			roleArray.push(...systemRoleIds)

			if (isAccepted) {
				const { title } = await roleQueries.findOne(
					{ id: result.role, status: common.activeStatus },
					{ attributes: ['title', 'id', 'user_type', 'status'] }
				)

				eventBroadcaster('roleChange', {
					requestBody: {
						userId: result.requester_id,
						new_roles: [title],
						old_roles: _.map(userRoles, 'title'),
					},
				})
			}

			roleArray.push(result.role)
			const roles = _.uniq(roleArray)

			await userQueries.updateUser(
				{ id: result.requester_id },
				{
					roles: roles,
				}
			)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message,
				result,
			})
		} catch (error) {
			throw error
		}
	}
}
