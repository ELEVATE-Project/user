/**
 * name : services/org-admin.js
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
const kafkaCommunication = require('@generics/kafka-communication')
const roleQueries = require('@database/queries/user-role')
const fileUploadQueries = require('@database/queries/fileUpload')
const orgRoleReqQueries = require('@database/queries/orgRoleRequest')
const entityTypeQueries = require('@database/queries/entityType')
const organizationQueries = require('@database/queries/organization')
const userOrganizationRoleQueries = require('@database/queries/userOrganizationRole')
const { eventBroadcaster } = require('@helpers/eventBroadcaster')
const { Queue } = require('bullmq')
const { Op } = require('sequelize')

const tenantDomainQueries = require('@database/queries/tenantDomain')
const emailEncryption = require('@utils/emailEncryption')
const responses = require('@helpers/responses')
const notificationUtils = require('@utils/notification')
const userHelper = require('@helpers/userHelper')

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
			const { id, organization_id } = tokenInformation
			const { name, email } = await userQueries.findOne(
				{ id, organization_id },
				{ attributes: ['name', 'email'] }
			)
			const adminPlaintextEmailId = emailEncryption.decrypt(email)

			const organization = await organizationQueries.findOne(
				{ id: organization_id },
				{ attributes: ['name', 'code'] }
			)

			const creationData = {
				name: utils.extractFilename(filePath),
				input_path: filePath,
				type: common.fileTypeCSV,
				organization_id,
				created_by: id,
			}

			const result = await fileUploadQueries.create(creationData)

			if (!result?.id) {
				return responses.successResponse({
					responseCode: 'CLIENT_ERROR',
					statusCode: httpStatusCode.bad_request,
					message: 'USER_CSV_UPLOADED_FAILED',
				})
			}

			//push to queue
			const redisConfiguration = utils.generateRedisConfigForQueue()
			const invitesQueue = new Queue(process.env.DEFAULT_QUEUE, redisConfiguration)
			await invitesQueue.add(
				'upload_invites',
				{
					fileDetails: result,
					user: {
						id,
						name,
						email: adminPlaintextEmailId,
						organization_id,
						org_name: organization.name,
						organization_code: organization.code,
					},
				},
				{
					removeOnComplete: true,
					attempts: common.NO_OF_ATTEMPTS,
					backoff: {
						type: 'fixed',
						delay: common.BACK_OFF_RETRY_QUEUE, // Wait 10 min between attempts
					},
				}
			)

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_CSV_UPLOADED',
				result: result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async bulkCreate(filePath, tokenInformation, editableFields = [], uploadType) {
		try {
			const { id, organization_id, tenant_code } = tokenInformation
			editableFields = Array.isArray(editableFields)
				? [...new Set(editableFields)]
				: [...new Set(editableFields.split(','))] // unique editable field array
			const { name, email } = await userQueries.findOne({ id }, { attributes: ['name', 'email'] })
			const adminPlaintextEmailId = emailEncryption.decrypt(email)

			const organization = await organizationQueries.findOne(
				{ id: organization_id, tenant_code },
				{ attributes: ['name', 'code'] }
			)

			const creationData = {
				name: utils.extractFilename(filePath),
				input_path: filePath,
				type: common.fileTypeCSV,
				organization_id,
				created_by: id,
				tenant_code,
				uploadType,
			}

			const result = await fileUploadQueries.create(creationData)

			if (!result?.id) {
				return responses.successResponse({
					responseCode: 'CLIENT_ERROR',
					statusCode: httpStatusCode.bad_request,
					message: 'USER_CSV_UPLOADED_FAILED',
				})
			}

			//push to queue
			const redisConfiguration = utils.generateRedisConfigForQueue()
			const invitesQueue = new Queue(process.env.DEFAULT_QUEUE, redisConfiguration)
			await invitesQueue.add(
				'bulk_user_create',
				{
					fileDetails: result,
					user: {
						id,
						name,
						email: adminPlaintextEmailId,
						organization_id,
						org_name: organization.name,
						organization_code: organization.code,
						tenant_code,
						editableFields,
						uploadType,
					},
				},
				{
					removeOnComplete: true,
					attempts: 1 || common.NO_OF_ATTEMPTS,
					backoff: {
						type: 'fixed',
						delay: common.BACK_OFF_RETRY_QUEUE, // Wait 10 min between attempts
					},
				}
			)

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_CSV_UPLOADED',
				result: result,
			})
		} catch (error) {
			console.log(error)
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
			const listFileUpload = await fileUploadQueries.listUploads({
				page: req.pageNo,
				limit: req.pageSize,
				filter: {
					...(req.query.status && { status: req.query.status }),
					organization_id: req.decodedToken.organization_id,
					tenant_code: req.decodedToken.tenant_code,
				},
			})

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

			return responses.successResponse({
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
	static async getRequestDetails(requestId, organization_id, tenantCode) {
		try {
			let requestDetails = await orgRoleReqQueries.requestDetails(
				{
					id: requestId,
					organization_id,
					tenant_code: tenantCode,
				},
				{
					attributes: {
						exclude: ['created_at', 'updated_at', 'deleted_at'],
					},
				}
			)

			if (!requestDetails) {
				return responses.failureResponse({
					message: 'REQUEST_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return responses.successResponse({
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
				tenant_code: params.decodedToken.tenant_code,
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
				raw: true,
			}

			let requestList = await orgRoleReqQueries.listAllRequests(
				filterQuery,
				params.pageNo,
				params.pageSize,
				options,
				params.decodedToken.organization_id
			)

			return responses.successResponse({
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
	static async updateRequestStatus(bodyData, tokenInformation) {
		try {
			const requestId = bodyData.request_id
			delete bodyData.request_id

			const requestDetail = await orgRoleReqQueries.requestDetails({
				id: requestId,
				organization_id: tokenInformation.organization_id,
				tenant_code: tokenInformation.tenant_code,
			})

			if (requestDetail.status !== common.REQUESTED_STATUS) {
				return responses.failureResponse({
					message: 'INAVLID_ORG_ROLE_REQ',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			bodyData.handled_by = tokenInformation.id
			const rowsAffected = await orgRoleReqQueries.update(
				{
					id: requestId,
					organization_id: tokenInformation.organization_id,
					tenant_code: tokenInformation.tenant_code,
				},
				bodyData
			)

			if (rowsAffected === 0) {
				return responses.failureResponse({
					message: 'ORG_ROLE_REQ_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const requestDetails = await orgRoleReqQueries.requestDetails({
				id: requestId,
				organization_id: tokenInformation.organization_id,
				tenant_code: tokenInformation.tenant_code,
			})

			const isApproved = bodyData.status === common.ACCEPTED_STATUS
			const isRejected = bodyData.status === common.REJECTED_STATUS

			const shouldSendEmail = isApproved || isRejected
			const message = isApproved ? 'ORG_ROLE_REQ_APPROVED' : 'ORG_ROLE_REQ_UPDATED'

			const user = await userQueries.findUserWithOrganization({
				id: requestDetails.requester_id,
				tenant_code: tokenInformation.tenant_code,
			})

			if (isApproved) {
				await updateRoleForApprovedRequest(
					requestDetails,
					user,
					tokenInformation.tenant_code,
					tokenInformation.organization_code
				)
			}

			if (shouldSendEmail) {
				await sendRoleRequestStatusEmail(
					user,
					bodyData.status,
					tokenInformation.organization_code,
					tokenInformation.tenant_code
				)
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message,
				result: requestDetails,
			})
		} catch (error) {
			console.log(error, 'error')
			throw error
		}
	}

	/**
	 * Deactivates users by their IDs or email addresses within a specific organization and tenant.
	 *
	 * This function performs the following:
	 * - Deactivates users by matching user IDs (if provided) under the same tenant and organization.
	 * - Deactivates users by matching emails (if provided) under the same tenant and organization.
	 * - Broadcasts an event to handle cleanup of upcoming sessions for deactivated users.
	 * - Removes all active sessions for the affected users.
	 *
	 * Note:
	 * - This function currently does **not** support users associated with multiple organizations.
	 *   It only considers users under the organization specified in `tokenInformation.organization_code`.
	 *
	 * @async
	 * @param {Object} bodyData - Request payload containing user identifiers.
	 * @param {number[]} [bodyData.ids] - Optional array of user IDs to deactivate.
	 * @param {string[]} [bodyData.emails] - Optional array of user emails to deactivate.
	 *
	 * @param {Object} tokenInformation - Authenticated user's context information.
	 * @param {string} tokenInformation.organization_code - The organization code for scoping the operation.
	 * @param {string} tokenInformation.tenant_code - The tenant code to match users within the same tenant.
	 * @param {number} tokenInformation.id - The ID of the user initiating the deactivation (used as `updated_by`).
	 *
	 * @returns {Promise<Object>} Response object with success or failure details.
	 * - If successful, includes the user IDs that were deactivated.
	 * - If no users were updated, returns a failure response with appropriate status.
	 *
	 * @throws {Error} Throws error on unexpected failure during the deactivation process.
	 */

	static async deactivateUser(bodyData, tokenInformation) {
		try {
			const { ids = [], emails = [] } = bodyData

			let totalRowsAffected = 0
			const updatedByIds = []
			const updatedByEmails = []

			// Deactivate by IDs
			if (ids.length) {
				const [rowsAffected, updatedUsers] = await userQueries.deactivateUserInOrg(
					{
						id: { [Op.in]: ids },
						tenant_code: tokenInformation.tenant_code,
					},
					tokenInformation.organization_code,
					tokenInformation.tenant_code,
					{
						status: common.INACTIVE_STATUS,
						updated_by: tokenInformation.id,
					},
					true // pass flag to return matched users (optional)
				)
				console.log(rowsAffected, updatedUsers)
				totalRowsAffected += rowsAffected
				updatedByIds.push(...updatedUsers.map((user) => user.id))
			}

			// Deactivate by Emails
			if (emails.length) {
				const [rowsAffected, updatedUsers] = await userQueries.deactivateUserInOrg(
					{
						email: { [Op.in]: emails.map((email) => emailEncryption.encrypt(email.toLowerCase())) },
						tenant_code: tokenInformation.tenant_code,
					},
					tokenInformation.organization_code,
					tokenInformation.tenant_code,
					{
						status: common.INACTIVE_STATUS,
						updated_by: tokenInformation.id,
					},
					true // return updated users
				)

				totalRowsAffected += rowsAffected
				updatedByEmails.push(...updatedUsers.map((user) => user.id))
			}

			// If nothing was deactivated
			if (totalRowsAffected === 0) {
				return responses.failureResponse({
					message: 'STATUS_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Broadcast event
			const allUserIds = [...new Set([...updatedByIds, ...updatedByEmails])]

			await userHelper.removeAllUserSessions(allUserIds, tokenInformation.tenant_code)

			eventBroadcaster('deactivateUpcomingSession', {
				requestBody: {
					user_ids: allUserIds,
				},
			})

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_DEACTIVATED',
				result: {
					updated_by_ids: updatedByIds,
					updated_by_emails: updatedByEmails,
				},
			})
		} catch (error) {
			console.error('Error in deactivateUser:', error)
			throw error
		}
	}

	/**
	 * @description                         - Inherit new entity type from an existing default org's entityType.
	 * @method
	 * @name                                - inheritEntityType
	 * @param {String} entityValue          - Entity type value
	 * @param {String} entityLabel          - Entity type label
	 * @param {String} userOrganizationCode - User's organization code
	 * @param {Integer} userOrganizationId  - User's organization ID
	 * @param {Integer} userId              - User ID
	 * @returns {Promise<Object>}           - A Promise that resolves to a response object.
	 */
	static async inheritEntityType(entityValue, entityLabel, userOrganizationCode, userOrganizationId, userId) {
		try {
			// Prevent inheriting from the default org
			if (process.env.DEFAULT_ORGANISATION_CODE === userOrganizationCode) {
				return responses.failureResponse({
					message: 'USER_IS_FROM_DEFAULT_ORG',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Fetch entity type data from default org
			const filter = {
				value: entityValue,
				organization_code: process.env.DEFAULT_ORGANISATION_CODE,
				allow_filtering: true,
			}

			const entityTypeDetails = await entityTypeQueries.findOneEntityType(filter)

			// If no matching data found, return failure
			if (!entityTypeDetails) {
				return responses.failureResponse({
					message: 'ENTITY_TYPE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Prepare new entity type object (clone and modify)
			const newEntityType = {
				...entityTypeDetails,
				parent_id: entityTypeDetails.id,
				label: entityLabel,
				organization_code: userOrganizationCode,
				organization_id: userOrganizationId,
				created_by: userId,
				updated_by: userId,
			}
			delete newEntityType.id

			// Create new inherited entity type
			const inheritedEntityType = await entityTypeQueries.createEntityType(newEntityType)

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ENTITY_TYPE_CREATED_SUCCESSFULLY',
				result: inheritedEntityType,
			})
		} catch (error) {
			console.error('Error in inheritEntityType:', error)
			throw error
		}
	}

	/**
	 * @description 					- Update user API for org-admin to assign role to user
	 * @method
	 * @name 							- updateUser
	 * @param {number} userId 			- User ID to which role is assigned
	 * @param {object} bodyData 		- It will contain organization id and roles array
	 * @param {object} tokenInformation - user token information
	 * @returns {Promise<Object>} 		- A Promise that resolves to a response object.
	 */

	static async updateUser(userId, bodyData, tokenInformation) {
		try {
			if (bodyData.organization_id == tokenInformation.organization_id) {
				let roles = _.without(bodyData.roles, common.ADMIN_ROLE)
				let getRoleIds = await roleQueries.findAll({ title: roles }, { attributes: ['id'] })
				if (!getRoleIds) {
					return responses.failureResponse({
						message: 'INVALID_ROLE_ASSIGNMENTS',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
				let roleIds = getRoleIds.map((roleId) => roleId.id)
				let checkUser = await userQueries.findOne({ id: userId })
				if (!checkUser) {
					return responses.failureResponse({
						responseCode: 'CLIENT_ERROR',
						statusCode: httpStatusCode.bad_request,
						message: 'USER_NOT_FOUND',
					})
				}
				await userQueries.updateUser({ id: userId }, { roles: roleIds })
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USER_ROLE_UPDATE_SUCCESSFUL',
				})
			} else {
				return responses.failureResponse({
					responseCode: 'CLIENT_ERROR',
					statusCode: httpStatusCode.bad_request,
					message: 'YOU_DONT_HAVE_ACCESS_TO_UPDATE_ROLES',
				})
			}
		} catch (error) {
			console.log(error)
			return error
		}
	}
}

function updateRoleForApprovedRequest(requestDetails, user, tenantCode, orgCode) {
	return new Promise(async (resolve, reject) => {
		try {
			const newRole = await roleQueries.findOne(
				{ id: requestDetails.role, status: common.ACTIVE_STATUS, tenant_code: tenantCode },
				{ attributes: ['title', 'id', 'user_type', 'status'] }
			)

			await userOrganizationRoleQueries.create({
				tenant_code: tenantCode,
				user_id: user.id,
				organization_code: orgCode,
				role_id: newRole.id,
			})

			eventBroadcaster('roleChange', {
				requestBody: {
					user_id: requestDetails.requester_id,
					new_roles: [newRole.title],
					current_roles: _.map(_.find(user.organizations, { code: orgCode })?.roles || [], 'title'),
				},
			})
			//delete from cache
			const redisUserKey = `${common.redisUserPrefix}${tenantCode}_${requestDetails.requester_id.toString()}`
			await utils.redisDel(redisUserKey)

			return resolve({
				success: true,
			})
		} catch (error) {
			console.log(error, 'error')
			return error
		}
	})
}

async function sendRoleRequestStatusEmail(userDetails, status, organizationCode, tenantCode) {
	try {
		const plaintextEmailId = emailEncryption.decrypt(userDetails.email)

		if (status === common.ACCEPTED_STATUS) {
			if (plaintextEmailId) {
				const tenantDomain = await tenantDomainQueries.findOne(
					{ tenant_code: tenantCode },
					{ attributes: ['domain'] }
				)

				const portalURL = tenantDomain?.domain || ''

				notificationUtils.sendEmailNotification({
					emailId: plaintextEmailId,
					templateCode: process.env.MENTOR_REQUEST_ACCEPTED_EMAIL_TEMPLATE_CODE,
					variables: {
						name: userDetails.name,
						appName: process.env.APP_NAME,
						orgName: _.find(userDetails.organizations, { code: organizationCode })?.name || '',
						portalURL,
					},
					tenantCode: userDetails.tenant_code,
					organization_code: organizationCode || null,
				})
			}
		} else if (status === common.REJECTED_STATUS) {
			if (plaintextEmailId) {
				notificationUtils.sendEmailNotification({
					emailId: plaintextEmailId,
					templateCode: process.env.MENTOR_REQUEST_REJECTED_EMAIL_TEMPLATE_CODE,
					variables: {
						name: userDetails.name,
						orgName: _.find(userDetails.organizations, { code: organizationCode })?.name || '',
					},
					tenantCode: userDetails.tenant_code,
					organization_code: organizationCode || null,
				})
			}
		}

		return { success: true }
	} catch (error) {
		console.error(error)
		return error
	}
}
