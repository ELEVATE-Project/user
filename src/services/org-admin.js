'use strict'
// Dependenices
const common = require('@constants/common')
const mentorQueries = require('@database/queries/mentorExtension')
const menteeQueries = require('@database/queries/userExtension')
const httpStatusCode = require('@generics/http-status')
const sessionQueries = require('@database/queries/sessions')
const adminService = require('./admin')
const OrganisationExtensionQueries = require('@database/queries/organisationExtension')
const entityTypeQueries = require('@database/queries/entityType')
const userRequests = require('@requests/user')
const utils = require('@generics/utils')
const _ = require('lodash')

module.exports = class OrgAdminService {
	/**
	 * @description 					- Change user's role based on the current role.
	 * @method
	 * @name 							- roleChange
	 * @param {Object} bodyData 		- The request body containing user data.
	 * @returns {Promise<Object>} 		- A Promise that resolves to a response object.
	 */

	static async roleChange(bodyData) {
		try {
			if (
				utils.validateRoleAccess(bodyData.current_roles, common.MENTOR_ROLE) &&
				utils.validateRoleAccess(bodyData.new_roles, common.MENTEE_ROLE)
			) {
				return await this.changeRoleToMentee(bodyData)
			} else if (
				utils.validateRoleAccess(bodyData.current_roles, common.MENTEE_ROLE) &&
				utils.validateRoleAccess(bodyData.new_roles, common.MENTOR_ROLE)
			) {
				return await this.changeRoleToMentor(bodyData)
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * @description 				- Change user's role to Mentee.
	 * @method
	 * @name 						- changeRoleToMentee
	 * @param {Object} bodyData 	- The request body.
	 * @returns {Object} 			- A Promise that resolves to a response object.
	 */
	static async changeRoleToMentee(bodyData) {
		try {
			// Check current role based on that swap data
			// If current role is mentor validate data from mentor_extenion table
			let mentorDetails = await mentorQueries.getMentorExtension(bodyData.user_id)
			// If such mentor return error
			if (!mentorDetails) {
				return common.failureResponse({
					message: 'MENTOR_EXTENSION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (bodyData.org_id) {
				mentorDetails.org_id = bodyData.org_id
				const organizationDetails = await userRequests.fetchDefaultOrgDetails(bodyData.org_id)
				if (!(organizationDetails.success && organizationDetails.data && organizationDetails.data.result)) {
					return common.failureResponse({
						message: 'ORGANIZATION_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				const orgPolicies = await OrganisationExtensionQueries.getById(bodyData.org_id)
				if (!orgPolicies?.org_id) {
					return common.failureResponse({
						message: 'ORG_EXTENSION_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
				mentorDetails.org_id = bodyData.org_id
				const newPolicy = await this.constructOrgPolicyObject(orgPolicies)
				mentorDetails = _.merge({}, mentorDetails, newPolicy)
				mentorDetails.visible_to_organizations = organizationDetails.data.result.related_orgs
			}

			// Add fetched mentor details to user_extension table
			const menteeCreationData = await menteeQueries.createMenteeExtension(mentorDetails)
			if (!menteeCreationData) {
				return common.failureResponse({
					message: 'MENTEE_EXTENSION_CREATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Delete upcoming sessions of user as mentor
			const removedSessionsDetail = await sessionQueries.removeAndReturnMentorSessions(bodyData.user_id)
			const isAttendeesNotified = await adminService.unenrollAndNotifySessionAttendees(removedSessionsDetail)

			// Delete mentor Extension
			if (isAttendeesNotified) {
				await mentorQueries.deleteMentorExtension(bodyData.user_id, true)
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_ROLE_UPDATED',
				result: {
					user_id: menteeCreationData.user_id,
					roles: bodyData.new_roles,
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * @description 				- Change user's role to Mentor.
	 * @method
	 * @name 						- changeRoleToMentor
	 * @param {Object} bodyData 	- The request body containing user data.
	 * @returns {Promise<Object>} 	- A Promise that resolves to a response object.
	 */

	static async changeRoleToMentor(bodyData) {
		try {
			// Get mentee_extension data
			let menteeDetails = await menteeQueries.getMenteeExtension(bodyData.user_id)
			// If no mentee present return error
			if (!menteeDetails) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTEE_EXTENSION_NOT_FOUND',
				})
			}

			if (bodyData.org_id) {
				let organizationDetails = await userRequests.fetchDefaultOrgDetails(bodyData.org_id)
				if (!(organizationDetails.success && organizationDetails.data && organizationDetails.data.result)) {
					return common.failureResponse({
						message: 'ORGANIZATION_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				const orgPolicies = await OrganisationExtensionQueries.getById(bodyData.org_id)
				if (!orgPolicies?.org_id) {
					return common.failureResponse({
						message: 'ORG_EXTENSION_NOT_FOUND',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
				menteeDetails.org_id = bodyData.org_id
				const newPolicy = await this.constructOrgPolicyObject(orgPolicies)
				menteeDetails = _.merge({}, menteeDetails, newPolicy)
				menteeDetails.visible_to_organizations = organizationDetails.data.result.related_orgs
			}

			// Add fetched mentee details to mentor_extension table
			const mentorCreationData = await mentorQueries.createMentorExtension(menteeDetails)
			if (!mentorCreationData) {
				return common.failureResponse({
					message: 'MENTOR_EXTENSION_CREATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Delete mentee extension (user_extension table)
			await menteeQueries.deleteMenteeExtension(bodyData.user_id, true)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_ROLE_UPDATED',
				result: {
					user_id: mentorCreationData.user_id,
					roles: bodyData.new_roles,
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async setOrgPolicies(decodedToken, policies) {
		try {
			if (!decodedToken.roles.some((role) => role.title === common.ORG_ADMIN_ROLE)) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			const orgPolicies = await OrganisationExtensionQueries.upsert({
				org_id: decodedToken.organization_id,
				...policies,
			})
			const orgPolicyUpdated =
				new Date(orgPolicies.dataValues.created_at).getTime() !==
				new Date(orgPolicies.dataValues.updated_at).getTime()

			// If org policies updated update mentor and mentee extensions uunder the org
			if (orgPolicyUpdated) {
				// if org policy is updated update mentor extension and user extension
				let policyData = await this.constructOrgPolicyObject(orgPolicies.dataValues)

				await mentorQueries.updateMentorExtension(
					'', //userId not required
					policyData, // data to update
					{}, //options
					{ org_id: decodedToken.organization_id } //custom filter for where clause
				)

				await menteeQueries.updateMenteeExtension(
					'', //userId not required
					policyData, // data to update
					{}, //options
					{ org_id: decodedToken.organization_id } //custom filter for where clause
				)
				// comenting as part of first level SAAS changes. will need this in the code next level
				// await sessionQueries.updateSession(
				// 	{
				// 		status: common.PUBLISHED_STATUS,
				// 		mentor_org_id: decodedToken.organization_id
				// 	},
				// 	{
				// 		visibility: orgPolicies.dataValues.session_visibility_policy
				// 	}
				// )
			}

			delete orgPolicies.dataValues.deleted_at
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_POLICIES_SET_SUCCESSFULLY',
				result: { ...orgPolicies.dataValues },
			})
		} catch (error) {
			throw new Error(`Error setting organisation policies: ${error.message}`)
		}
	}

	static async getOrgPolicies(decodedToken) {
		try {
			if (!decodedToken.roles.some((role) => role.title === common.ORG_ADMIN_ROLE)) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			const orgPolicies = await OrganisationExtensionQueries.getById(decodedToken.organization_id)
			if (orgPolicies) {
				delete orgPolicies.dataValues.deleted_at
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ORG_POLICIES_FETCHED_SUCCESSFULLY',
					result: { ...orgPolicies.dataValues },
				})
			} else {
				throw new Error(`No organisation extension found for org_id ${decodedToken.organization_id}`)
			}
		} catch (error) {
			throw new Error(`Error reading organisation policies: ${error.message}`)
		}
	}

	/**
	 * @description 					- Inherit new entity type from an existing default org's entityType.
	 * @method
	 * @name 							- inheritEntityType
	 * @param {String} entityValue 		- Entity type value
	 * @param {String} entityLabel 		- Entity type label
	 * @param {Integer} userOrgId 		- User org id
	 * @param {Object} decodedToken 	- User token details
	 * @returns {Promise<Object>} 		- A Promise that resolves to a response object.
	 */

	static async inheritEntityType(entityValue, entityLabel, userOrgId, decodedToken) {
		try {
			if (!decodedToken.roles.some((role) => role.title === common.ORG_ADMIN_ROLE)) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			// Get default organisation details
			let defaultOrgDetails = await userRequests.fetchDefaultOrgDetails(process.env.DEFAULT_ORGANISATION_CODE)

			let defaultOrgId
			if (defaultOrgDetails.success && defaultOrgDetails.data && defaultOrgDetails.data.result) {
				defaultOrgId = defaultOrgDetails.data.result.id
			} else {
				return common.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (defaultOrgId === userOrgId) {
				return common.failureResponse({
					message: 'USER_IS_FROM_DEFAULT_ORG',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Fetch entity type data using defaultOrgId and entityValue
			const filter = {
				value: entityValue,
				org_id: defaultOrgId,
				allow_filtering: true,
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
			entityTypeDetails.created_by = decodedToken.id
			entityTypeDetails.updated_by = decodedToken.id
			delete entityTypeDetails.id

			// Create new inherited entity type
			let inheritedEntityType = await entityTypeQueries.createEntityType(entityTypeDetails)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ENTITY_TYPE_CREATED_SUCCESSFULLY',
				result: inheritedEntityType,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Update User Organization.
	 * @method
	 * @name updateOrganization
	 * @param {Object} bodyData
	 * @returns {JSON} - User data.
	 */
	static async updateOrganization(bodyData) {
		try {
			const orgId = bodyData.org_id

			// Get organization details
			let organizationDetails = await userRequests.fetchDefaultOrgDetails(orgId)
			if (!(organizationDetails.success && organizationDetails.data && organizationDetails.data.result)) {
				return common.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Get organization policies
			const orgPolicies = await OrganisationExtensionQueries.getById(orgId)
			if (!orgPolicies?.org_id) {
				return common.failureResponse({
					message: 'ORG_EXTENSION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			//Update the policy
			const updateData = {
				org_id: orgId,
				external_session_visibility: orgPolicies.external_session_visibility_policy,
				external_mentor_visibility: orgPolicies.external_mentor_visibility_policy,
				visibility: orgPolicies.mentor_visibility_policy,
				visible_to_organizations: organizationDetails.data.result.related_orgs,
			}

			if (utils.validateRoleAccess(bodyData.roles, common.MENTOR_ROLE)) {
				await mentorQueries.updateMentorExtension(bodyData.user_id, updateData)
			} else {
				await menteeQueries.updateMenteeExtension(bodyData.user_id, updateData)
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'UPDATE_ORG_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Deactivate upcoming session.
	 * @method
	 * @name deactivateUpcomingSession
	 * @param {Object} bodyData
	 * @returns {JSON} - User data.
	 */
	static async deactivateUpcomingSession(userId) {
		try {
			let message
			const mentorDetails = await mentorQueries.getMentorExtension(userId)
			if (mentorDetails?.user_id) {
				// Delete upcoming sessions of user as mentor
				const removedSessionsDetail = await sessionQueries.removeAndReturnMentorSessions(userId)
				await adminService.unenrollAndNotifySessionAttendees(removedSessionsDetail)
				message = 'SESSION_DEACTIVATED_SUCCESSFULLY'
			}

			//unenroll from upcoming session
			const menteeDetails = await menteeQueries.getMenteeExtension(userId)
			if (menteeDetails?.user_id) {
				await adminService.unenrollFromUpcomingSessions(userId)
				message = 'SUCCESSFULLY_UNENROLLED_FROM_UPCOMING_SESSION'
			}

			if (!mentorDetails?.user_id && !menteeDetails?.user_id) {
				return common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
	/**
	 * @description 							- constuct organisation policy object for mentor_extension/user_extension.
	 * @method
	 * @name 									- constructOrgPolicyObject
	 * @param {Object} organisationPolicy 		- organisation policy data
	 * @param {Boolean} addOrgId 				- Boolean that specifies if org_id needs to be added or not
	 * @returns {Object} 						- A object that reurn a response object.
	 */
	static async constructOrgPolicyObject(organisationPolicy, addOrgId = false) {
		const {
			mentor_visibility_policy,
			external_session_visibility_policy,
			external_mentor_visibility_policy,
			org_id,
		} = organisationPolicy
		// create policy object
		let policyData = {
			visibility: mentor_visibility_policy,
			external_session_visibility: external_session_visibility_policy,
			external_mentor_visibility: external_mentor_visibility_policy,
		}
		// add org_id value if requested
		if (addOrgId) {
			policyData.org_id = org_id
		}
		return policyData
	}
}
