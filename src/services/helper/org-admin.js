// Dependenices
const common = require('@constants/common')
const mentorQueries = require('../../database/queries/mentorextension')
const menteeQueries = require('../../database/queries/userextension')
const httpStatusCode = require('@generics/http-status')
const sessionQueries = require('../../database/queries/sessions')
const adminService = require('./admin')

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
			if (bodyData.current_roles[0] === common.MENTOR_ROLE) {
				return await this.changeRoleToMentee(bodyData)
			} else if (bodyData.current_roles[0] === common.MENTEE_ROLE) {
				return await this.changeRoleToMentor(bodyData)
			}
		} catch (error) {
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
			const mentorDetails = await mentorQueries.getMentorExtension(bodyData.user_id)
			// If such mentor return error
			if (!mentorDetails) {
				return common.failureResponse({
					message: 'MENTOR_EXTENSION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
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
					roles: menteeCreationData.roles,
				},
			})
		} catch (error) {
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
			const menteeDetails = await menteeQueries.getMenteeExtension(bodyData.user_id)
			// If no mentee present return error
			if (!menteeDetails) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTEE_EXTENSION_NOT_FOUND',
				})
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
					roles: mentorCreationData.roles,
				},
			})
		} catch (error) {
			throw error
		}
	}
}
