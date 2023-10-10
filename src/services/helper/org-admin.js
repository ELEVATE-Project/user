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
const entityTypeQueries = require('@database/queries/entityType')
const organizationQueries = require('@database/queries/organization')

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
			const creationData = {
				name: utils.extractFilename(filePath),
				input_path: filePath,
				type: common.fileTypeCSV,
				created_by: tokenInformation.id,
			}

			const result = await fileUploadQueries.create(creationData)
			//push to queue
			await invitesQueue.add(
				{
					fileUploadData: result,
					userInfo: {
						id: tokenInformation.id,
						email: tokenInformation.email,
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

			if (isAccepted) {
				//call event to update mentoring
			}

			let result = await orgRoleReqQueries.requestDetails({ id })

			let roleArray = []
			let user = await userQueries.findByPk(result.requester_id)

			if (user.roles?.length) {
				const userRoles = await roleQueries.findAll(
					{ id: user.roles, status: common.activeStatus },
					{ attributes: ['title', 'id', 'user_type'] }
				)

				const systemRoleIds = userRoles
					.filter((role) => role.user_type === common.roleTypeSystem)
					.map((role) => role.id)
				roleArray.push(...systemRoleIds)
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

	/**
	 * @description 					- Inherit new entity type from an existing default org's entityType.
	 * @method
	 * @name 							- inheritEntityType
	 * @param {String} entityValue 		- Entity type value
	 * @param {String} entityLabel 		- Entity type label
	 * @param {Integer} userOrgId 		- User org id
	 * @returns {Promise<Object>} 		- A Promise that resolves to a response object.
	 */

	static async inheritEntityType(entityValue, entityLabel, userOrgId) {
		try {
			let defaultOrgId = await organizationQueries.findOne(
				{code: process.env.DEFAULT_ORGANISATION_CODE},
				{ attributes: ['id'] }
			)
			defaultOrgId = defaultOrgId.id
			// Fetch entity type data using defaultOrgId and entityValue
			const filter = {
				value: entityValue,
				org_id: defaultOrgId
			}
			
			let entityTypeDetails = await entityTypeQueries.findOneEntityType(filter)
			
			// If no matching data found return failure response
			if (!entityTypeDetails) {
				return common.failureResponse({
					message: 'ENTITY_TYPE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
	
			// Build data for inheriting entityType
			entityTypeDetails.parent_id = entityTypeDetails.org_id
			entityTypeDetails.label = entityLabel
			entityTypeDetails.org_id = userOrgId
			delete entityTypeDetails.id
			
			// Create new inherited entity type
			let inheritedEntityType = await entityTypeQueries.createEntityType(entityTypeDetails)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ENTITY_TYPE_CREATED_SUCCESSFULLY',
				result: inheritedEntityType,
			})

		} catch (error) {
			throw error
		}
	}
}
