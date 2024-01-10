// Dependencies
const utils = require('@generics/utils')
const userRequests = require('@requests/user')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const mentorQueries = require('@database/queries/mentorExtension')
const menteeQueries = require('@database/queries/userExtension')
const { UniqueConstraintError } = require('sequelize')
const _ = require('lodash')
const sessionAttendeesQueries = require('@database/queries/sessionAttendees')
const sessionQueries = require('@database/queries/sessions')
const entityTypeQueries = require('@database/queries/entityType')
const organisationExtensionQueries = require('@database/queries/organisationExtension')
const orgAdminService = require('@services/org-admin')
const { getDefaultOrgId } = require('@helpers/getDefaultOrgId')
const { Op } = require('sequelize')
const { removeDefaultOrgEntityTypes } = require('@generics/utils')
const moment = require('moment')
const menteesService = require('@services/mentees')
const entityTypeService = require('@services/entity-type')

module.exports = class MentorsHelper {
	/**
	 * upcomingSessions.
	 * @method
	 * @name upcomingSessions
	 * @param {String} id - user id.
	 * @param {String} page - Page No.
	 * @param {String} limit - Page size limit.
	 * @param {String} search - Search text.
	 * @returns {JSON} - mentors upcoming session details
	 */
	static async upcomingSessions(id, page, limit, search = '', menteeUserId, queryParams, isAMentor) {
		try {
			const query = utils.processQueryParametersWithExclusions(queryParams)
			console.log(query)
			let validationData = await entityTypeQueries.findAllEntityTypesAndEntities({
				status: 'ACTIVE',
			})
			const filteredQuery = utils.validateFilters(query, JSON.parse(JSON.stringify(validationData)), 'sessions')

			const mentorsDetails = await mentorQueries.getMentorExtension(id)
			if (!mentorsDetails) {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'MENTORS_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Filter upcoming sessions based on saas policy
			const saasFilter = await menteesService.filterSessionsBasedOnSaasPolicy(menteeUserId, isAMentor)

			let upcomingSessions = await sessionQueries.getMentorsUpcomingSessionsFromView(
				page,
				limit,
				search,
				id,
				filteredQuery,
				saasFilter
			)

			if (!upcomingSessions.data.length) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'UPCOMING_SESSION_FETCHED',
					result: {
						data: [],
						count: 0,
					},
				})
			}

			upcomingSessions.data = await this.sessionMentorDetails(upcomingSessions.data)
			if (menteeUserId && id != menteeUserId) {
				upcomingSessions.data = await this.menteeSessionDetails(upcomingSessions.data, menteeUserId)
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'UPCOMING_SESSION_FETCHED',
				result: upcomingSessions,
			})
		} catch (err) {
			return err
		}
	}

	/**
	 * Profile.
	 * @method
	 * @name profile
	 * @param {String} userId - user id.
	 * @returns {JSON} - profile details
	 */
	/* 	static async profile(id) {
		try {
			const mentorsDetails = await userRequests.details('', id)
			if (mentorsDetails.data.result.isAMentor && mentorsDetails.data.result.deleted === false) {
				const _id = mentorsDetails.data.result._id
				const filterSessionAttended = { userId: _id, isSessionAttended: true }
				const totalSessionsAttended = await sessionAttendees.countAllSessionAttendees(filterSessionAttended)
				const filterSessionHosted = { userId: _id, status: 'completed', isStarted: true, delete: false }
				const totalSessionHosted = await sessionsData.findSessionHosted(filterSessionHosted)
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FTECHED_SUCCESSFULLY',
					result: {
						sessionsAttended: totalSessionsAttended,
						sessionsHosted: totalSessionHosted,
						...mentorsDetails.data.result,
					},
				})
			} else {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'MENTORS_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}
		} catch (err) {
			return err
		}
	} */

	/**
	 * Mentors reports.
	 * @method
	 * @name reports
	 * @param {String} userId - user id.
	 * @param {String} filterType - MONTHLY/WEEKLY/QUARTERLY.
	 * @returns {JSON} - Mentors reports
	 */

	static async reports(userId, filterType, roles) {
		try {
			if (!utils.isAMentor(roles)) {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'MENTORS_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}

			let filterStartDate, filterEndDate

			switch (filterType) {
				case 'MONTHLY':
					;[filterStartDate, filterEndDate] = utils.getCurrentMonthRange()
					break
				case 'WEEKLY':
					;[filterStartDate, filterEndDate] = utils.getCurrentWeekRange()
					break
				case 'QUARTERLY':
					;[filterStartDate, filterEndDate] = utils.getCurrentQuarterRange()
					break
				default:
					throw new Error('Invalid filterType')
			}

			const totalSessionsCreated = await sessionQueries.getCreatedSessionsCountInDateRange(
				userId,
				filterStartDate.toISOString(),
				filterEndDate.toISOString()
			)

			const totalSessionsHosted = await sessionQueries.getHostedSessionsCountInDateRange(
				userId,
				Date.parse(filterStartDate) / 1000, // Converts milliseconds to seconds
				Date.parse(filterEndDate) / 1000
			)

			const result = { total_session_created: totalSessionsCreated, total_session_hosted: totalSessionsHosted }
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTORS_REPORT_FETCHED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Shareable mentor profile link.
	 * @method
	 * @name share
	 * @param {String} _id - Mentors user id.
	 * @returns {JSON} - Returns sharable link of the mentor.
	 */
	static async share(id) {
		try {
			const mentorsDetails = await mentorQueries.getMentorExtension(id)
			if (!mentorsDetails) {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'MENTORS_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}
			const shareLink = await userRequests.share(id)
			return shareLink
		} catch (error) {
			return error
		}
	}

	static async sessionMentorDetails(session) {
		try {
			if (session.length > 0) {
				const userIds = _.uniqBy(session, 'mentor_id').map((item) => item.mentor_id)

				let mentorDetails = await userRequests.getListOfUserDetails(userIds)
				mentorDetails = mentorDetails.result

				for (let i = 0; i < session.length; i++) {
					let mentorIndex = mentorDetails.findIndex((x) => x.id === session[i].mentor_id)
					session[i].mentor_name = mentorDetails[mentorIndex].name
					session[i].organization = mentorDetails[mentorIndex].organization
				}

				await Promise.all(
					session.map(async (sessions) => {
						if (sessions.image && sessions.image.length > 0) {
							sessions.image = sessions.image.map(async (imgPath) => {
								if (imgPath && imgPath != '') {
									return await utils.getDownloadableUrl(imgPath)
								}
							})
							sessions.image = await Promise.all(sessions.image)
						}
					})
				)

				return session
			} else {
				return session
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async menteeSessionDetails(sessions, userId) {
		try {
			if (sessions.length > 0) {
				const sessionIds = sessions.map((session) => session.id)

				const attendees = await sessionAttendeesQueries.findAll({
					session_id: sessionIds,
					mentee_id: userId,
				})

				await Promise.all(
					sessions.map(async (session) => {
						const attendee = attendees.find((attendee) => attendee.session_id === session.id)
						session.is_enrolled = !!attendee
					})
				)

				return sessions
			} else {
				return sessions
			}
		} catch (err) {
			return err
		}
	}

	//Functions for new APIS
	/**
	 * Create a new mentor extension.
	 * @method
	 * @name createMentorExtension
	 * @param {Object} data - Mentor extension data to be created.
	 * @param {String} userId - User ID of the mentor.
	 * @returns {Promise<Object>} - Created mentor extension details.
	 */
	static async createMentorExtension(data, userId, orgId) {
		try {
			// Call user service to fetch organisation details --SAAS related changes
			let userOrgDetails = await userRequests.fetchDefaultOrgDetails(orgId)

			// Return error if user org does not exists
			if (!userOrgDetails.success || !userOrgDetails.data || !userOrgDetails.data.result) {
				return common.failureResponse({
					message: 'ORGANISATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			// Find organisation policy from organisation_extension table
			let organisationPolicy = await organisationExtensionQueries.findOrInsertOrganizationExtension(orgId)

			data.user_id = userId
			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId)
				return common.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})

			let entityTypes = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [orgId, defaultOrgId],
				},
			})

			//validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))
			const validationData = removeDefaultOrgEntityTypes(entityTypes, orgId)

			let res = utils.validateInput(data, validationData, 'MentorExtension')
			if (!res.success) {
				return common.failureResponse({
					message: 'SESSION_CREATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: res.errors,
				})
			}
			let mentorExtensionsModel = await mentorQueries.getColumns()
			data = utils.restructureBody(data, validationData, mentorExtensionsModel)

			// construct saas policy data
			let saasPolicyData = await orgAdminService.constructOrgPolicyObject(organisationPolicy, true)

			userOrgDetails.data.result.related_orgs = userOrgDetails.data.result.related_orgs
				? userOrgDetails.data.result.related_orgs.concat([saasPolicyData.organization_id])
				: [saasPolicyData.organization_id]

			// update mentee extension data
			data = {
				...data,
				...saasPolicyData,
				visible_to_organizations: userOrgDetails.data.result.related_orgs,
			}

			const response = await mentorQueries.createMentorExtension(data)

			const processDbResponse = utils.processDbResponse(response.toJSON(), validationData)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_CREATED',
				result: processDbResponse,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return common.failureResponse({
					message: 'MENTOR_EXTENSION_CREATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return error
		}
	}

	/**
	 * Update a mentor extension.
	 * @method
	 * @name updateMentorExtension
	 * @param {String} userId - User ID of the mentor.
	 * @param {Object} data - Updated mentor extension data excluding user_id.
	 * @returns {Promise<Object>} - Updated mentor extension details.
	 */
	static async updateMentorExtension(data, userId, orgId) {
		try {
			// Remove certain data in case it is getting passed
			const dataToRemove = [
				'user_id',
				'visibility',
				'visible_to_organizations',
				'external_session_visibility',
				'external_mentor_visibility',
			]

			dataToRemove.forEach((key) => {
				if (data[key]) {
					delete data[key]
				}
			})

			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId)
				return common.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})

			let entityTypes = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [orgId, defaultOrgId],
				},
			})
			const validationData = removeDefaultOrgEntityTypes(entityTypes, orgId)
			let mentorExtensionsModel = await mentorQueries.getColumns()

			data = utils.restructureBody(data, validationData, mentorExtensionsModel)

			const [updateCount, updatedMentor] = await mentorQueries.updateMentorExtension(userId, data, {
				returning: true,
				raw: true,
			})

			if (updateCount === 0) {
				const fallbackUpdatedUser = await mentorQueries.getMentorExtension(userId)
				if (!fallbackUpdatedUser) {
					return common.failureResponse({
						statusCode: httpStatusCode.not_found,
						message: 'MENTOR_EXTENSION_NOT_FOUND',
					})
				}

				const processDbResponse = utils.processDbResponse(fallbackUpdatedUser, validationData)
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'MENTOR_EXTENSION_UPDATED',
					result: processDbResponse,
				})
			}

			//validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))

			const processDbResponse = utils.processDbResponse(updatedMentor[0], validationData)
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_UPDATED',
				result: processDbResponse,
			})
		} catch (error) {
			return error
		}
	}

	/**
	 * Get mentor extension details by user ID.
	 * @method
	 * @name getMentorExtension
	 * @param {String} userId - User ID of the mentor.
	 * @returns {Promise<Object>} - Mentor extension details.
	 */
	static async getMentorExtension(userId) {
		try {
			const mentor = await mentorQueries.getMentorExtension(userId)
			if (!mentor) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTOR_EXTENSION_NOT_FOUND',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_FETCHED',
				result: mentor,
			})
		} catch (error) {
			return error
		}
	}

	/**
	 * Delete a mentor extension by user ID.
	 * @method
	 * @name deleteMentorExtension
	 * @param {String} userId - User ID of the mentor.
	 * @returns {Promise<Object>} - Indicates if the mentor extension was deleted successfully.
	 */
	static async deleteMentorExtension(userId) {
		try {
			const deleteCount = await mentorQueries.deleteMentorExtension(userId)
			if (deleteCount === '0') {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTOR_EXTENSION_NOT_FOUND',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_EXTENSION_DELETED',
			})
		} catch (error) {
			return error
		}
	}

	/**
	 * Read.
	 * @method
	 * @name read
	 * @param {Number} id 						- mentor id.
	 * @param {Number} orgId 					- org id
	 * @param {Number} userId 					- User id.
	 * @param {Boolean} isAMentor 				- user mentor or not.
	 * @returns {JSON} 							- profile details
	 */
	static async read(id, orgId, userId = '', isAMentor = '') {
		try {
			if (userId !== '' && isAMentor !== '') {
				// Get mentor visibility and org id
				let requstedMentorExtension = await mentorQueries.getMentorExtension(id, [
					'visibility',
					'organization_id',
					'visible_to_organizations',
				])

				// Throw error if extension not found
				if (!requstedMentorExtension || Object.keys(requstedMentorExtension).length === 0) {
					return common.failureResponse({
						statusCode: httpStatusCode.not_found,
						message: 'MENTORS_NOT_FOUND',
					})
				}

				// Check for accessibility for reading shared mentor profile
				const isAccessible = await this.checkIfMentorIsAccessible([requstedMentorExtension], userId, isAMentor)

				// Throw access error
				if (!isAccessible) {
					return common.failureResponse({
						statusCode: httpStatusCode.not_found,
						message: 'PROFILE_RESTRICTED',
					})
				}
			}

			let mentorProfile = await userRequests.details('', id)
			if (!mentorProfile.data.result) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTORS_NOT_FOUND',
				})
			}
			if (!orgId) {
				orgId = mentorProfile.data.result.organization_id
			}

			let mentorExtension = await mentorQueries.getMentorExtension(id)

			if (!mentorProfile.data.result || !mentorExtension) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'MENTORS_NOT_FOUND',
				})
			}
			mentorProfile = utils.deleteProperties(mentorProfile.data.result, ['created_at', 'updated_at'])

			mentorExtension = utils.deleteProperties(mentorExtension, ['user_id', 'visible_to_organizations'])

			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId)
				return common.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})

			let entityTypes = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [orgId, defaultOrgId],
				},
			})

			// validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))
			const validationData = removeDefaultOrgEntityTypes(entityTypes, orgId)
			const processDbResponse = utils.processDbResponse(mentorExtension, validationData)

			const totalSessionHosted = await sessionQueries.countHostedSessions(id)

			const totalSession = await sessionAttendeesQueries.countEnrolledSessions(id)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'PROFILE_FTECHED_SUCCESSFULLY',
				result: {
					sessions_attended: totalSession,
					sessions_hosted: totalSessionHosted,
					...mentorProfile,
					...processDbResponse,
				},
			})
		} catch (error) {
			console.error(error)
			return error
		}
	}

	/**
	 * @description 							- check if mentor is accessible based on user's saas policy.
	 * @method
	 * @name checkIfMentorIsAccessible
	 * @param {Number} userId 					- User id.
	 * @param {Array}							- Session data
	 * @param {Boolean} isAMentor 				- user mentor or not.
	 * @returns {JSON} 							- List of filtered sessions
	 */
	static async checkIfMentorIsAccessible(userData, userId, isAMentor) {
		try {
			// user can be mentor or mentee, based on isAMentor key get policy details
			const userPolicyDetails = isAMentor
				? await mentorQueries.getMentorExtension(userId, ['external_mentor_visibility', 'organization_id'])
				: await menteeQueries.getMenteeExtension(userId, ['external_mentor_visibility', 'organization_id'])

			// Throw error if mentor/mentee extension not found
			if (!userPolicyDetails || Object.keys(userPolicyDetails).length === 0) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: isAMentor ? 'MENTORS_NOT_FOUND' : 'MENTEE_EXTENSION_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}

			// check the accessibility conditions
			let isAccessible = false
			if (userPolicyDetails.external_mentor_visibility && userPolicyDetails.organization_id) {
				const { external_mentor_visibility, organization_id } = userPolicyDetails
				const mentor = userData[0]
				switch (external_mentor_visibility) {
					/**
					 * if user external_mentor_visibility is current. He can only see his/her organizations mentors
					 * so we will check mentor's organization_id and user organization_id are matching
					 */
					case common.CURRENT:
						isAccessible = mentor.organization_id === organization_id
						break
					/**
					 * If user external_mentor_visibility is associated
					 * <<point**>> first we need to check if mentor's visible_to_organizations contain the user organization_id and verify mentor's visibility is not current (if it is ALL and ASSOCIATED it is accessible)
					 */
					case common.ASSOCIATED:
						isAccessible =
							(mentor.visible_to_organizations.includes(organization_id) &&
								mentor.visibility != common.CURRENT) ||
							mentor.organization_id === organization_id
						break
					/**
					 * We need to check if mentor's visible_to_organizations contain the user organization_id and verify mentor's visibility is not current (if it is ALL and ASSOCIATED it is accessible)
					 * OR if mentor visibility is ALL that mentor is also accessible
					 */
					case common.ALL:
						isAccessible =
							(mentor.visible_to_organizations.includes(organization_id) &&
								mentor.visibility != common.CURRENT) ||
							mentor.visibility === common.ALL ||
							mentor.organization_id === organization_id
						break
					default:
						break
				}
			}
			return isAccessible
		} catch (err) {
			return err
		}
	}
	/**
	 * Get user list.
	 * @method
	 * @name create
	 * @param {Number} pageSize -  Page size.
	 * @param {Number} pageNo -  Page number.
	 * @param {String} searchText -  Search text.
	 * @param {JSON} queryParams -  Query params.
	 * @param {Boolean} isAMentor -  Is a mentor.
	 * @returns {JSON} - User list.
	 */

	static async list(pageNo, pageSize, searchText, queryParams, userId, isAMentor) {
		try {
			let additionalProjectionString = ''

			// check for fields query
			if (queryParams.fields && queryParams.fields !== '') {
				additionalProjectionString = queryParams.fields
				delete queryParams.fields
			}

			const query = utils.processQueryParametersWithExclusions(queryParams)

			let validationData = await entityTypeQueries.findAllEntityTypesAndEntities({
				status: 'ACTIVE',
			})

			const filteredQuery = utils.validateFilters(query, JSON.parse(JSON.stringify(validationData)), 'Session')
			const userType = common.MENTOR_ROLE

			const saasFilter = await this.filterMentorListBasedOnSaasPolicy(userId, isAMentor)

			let extensionDetails = await mentorQueries.getMentorsByUserIdsFromView(
				[],
				null,
				null,
				filteredQuery,
				saasFilter,
				additionalProjectionString,
				true
			)
			if (extensionDetails.count == 0) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'MENTOR_LIST',
					result: {
						data: [],
						count: 0,
					},
				})
			}
			const mentorIds = extensionDetails.data.map((item) => item.user_id)

			const userDetails = await userRequests.search(userType, pageNo, pageSize, searchText, mentorIds)
			if (userDetails.data.result.count == 0) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'MENTOR_LIST',
					result: {
						data: [],
						count: 0,
					},
				})
			}
			extensionDetails = await mentorQueries.getMentorsByUserIdsFromView(
				userDetails.data.result.data.map((item) => item.id),
				null,
				null,
				filteredQuery,
				saasFilter,
				additionalProjectionString,
				false
			)

			if (extensionDetails.data.length > 0) {
				const uniqueOrgIds = [...new Set(extensionDetails.data.map((obj) => obj.organization_id))]
				extensionDetails.data = await entityTypeService.processEntityTypesToAddValueLabels(
					extensionDetails.data,
					uniqueOrgIds,
					common.mentorExtensionModelName,
					'organization_id'
				)
			}

			const extensionDataMap = new Map(extensionDetails.data.map((newItem) => [newItem.user_id, newItem]))

			userDetails.data.result.data = userDetails.data.result.data
				.map((value) => {
					// Map over each value in the values array of the current group
					const user_id = value.id
					// Check if extensionDataMap has an entry with the key equal to the user_id
					if (extensionDataMap.has(user_id)) {
						const newItem = extensionDataMap.get(user_id)
						value = { ...value, ...newItem }
						delete value.user_id
						delete value.visibility
						delete value.organization_id
						delete value.meta
						return value
					}
					return null
				})
				.filter((value) => value !== null)

			let foundKeys = {}
			let result = []

			for (let user of userDetails.data.result.data) {
				let firstChar = user.name.charAt(0)
				firstChar = firstChar.toUpperCase()

				if (!foundKeys[firstChar]) {
					result.push({
						key: firstChar,
						values: [user],
					})
					foundKeys[firstChar] = result.length
				} else {
					let index = foundKeys[firstChar] - 1
					result[index].values.push(user)
				}
			}

			const sortedData = _.sortBy(result, 'key') || []
			userDetails.data.result.data = sortedData

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: userDetails.data.message,
				result: userDetails.data.result,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
	/**
	 * @description 							- Filter mentor list based on user's saas policy.
	 * @method
	 * @name filterMentorListBasedOnSaasPolicy
	 * @param {Number} userId 					- User id.
	 * @param {Boolean} isAMentor 				- user mentor or not.
	 * @returns {JSON} 							- List of filtered sessions
	 */
	static async filterMentorListBasedOnSaasPolicy(userId, isAMentor) {
		try {
			const userPolicyDetails = isAMentor
				? await mentorQueries.getMentorExtension(userId, ['external_mentor_visibility', 'organization_id'])
				: await menteeQueries.getMenteeExtension(userId, ['external_mentor_visibility', 'organization_id'])

			// Throw error if mentor/mentee extension not found
			if (!userPolicyDetails || Object.keys(userPolicyDetails).length === 0) {
				return common.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: isAMentor ? 'MENTORS_NOT_FOUND' : 'MENTEE_EXTENSION_NOT_FOUND',
					responseCode: 'CLIENT_ERROR',
				})
			}

			let filter = ''
			if (userPolicyDetails.external_mentor_visibility && userPolicyDetails.organization_id) {
				// Filter user data based on policy
				// generate filter based on condition
				if (userPolicyDetails.external_mentor_visibility === common.CURRENT) {
					/**
					 * if user external_mentor_visibility is current. He can only see his/her organizations mentors
					 * so we will check mentor's organization_id and user organization_id are matching
					 */
					filter = `AND "organization_id" = ${userPolicyDetails.organization_id}`
				} else if (userPolicyDetails.external_mentor_visibility === common.ASSOCIATED) {
					/**
					 * If user external_mentor_visibility is associated
					 * <<point**>> first we need to check if mentor's visible_to_organizations contain the user organization_id and verify mentor's visibility is not current (if it is ALL and ASSOCIATED it is accessible)
					 */
					filter = `AND ((${userPolicyDetails.organization_id} = ANY("visible_to_organizations") AND "visibility" != 'CURRENT') OR "organization_id" = ${userPolicyDetails.organization_id})`
				} else if (userPolicyDetails.external_mentor_visibility === common.ALL) {
					/**
					 * We need to check if mentor's visible_to_organizations contain the user organization_id and verify mentor's visibility is not current (if it is ALL and ASSOCIATED it is accessible)
					 * OR if mentor visibility is ALL that mentor is also accessible
					 */
					filter = `AND ((${userPolicyDetails.organization_id} = ANY("visible_to_organizations") AND "visibility" != 'CURRENT' ) OR "visibility" = 'ALL' OR "organization_id" = ${userPolicyDetails.organization_id})`
				}
			}

			return filter
		} catch (err) {
			return err
		}
	}

	/**
	 * Sessions list
	 * @method
	 * @name list
	 * @param {Object} req -request data.
	 * @param {String} req.decodedToken.id - User Id.
	 * @param {String} req.pageNo - Page No.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - Session List.
	 */

	static async createdSessions(loggedInUserId, page, limit, search, status, roles) {
		try {
			if (!utils.isAMentor(roles)) {
				return common.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'NOT_A_MENTOR',
					responseCode: 'CLIENT_ERROR',
				})
			}
			// update sessions which having status as published/live and  exceeds the current date and time
			const currentDate = Math.floor(moment.utc().valueOf() / 1000)
			/* 			const filterQuery = {
				[Op.or]: [
					{
						status: common.PUBLISHED_STATUS,
						end_date: {
							[Op.lt]: currentDate,
						},
					},
					{
						status: common.LIVE_STATUS,
						'meeting_info.value': {
							[Op.ne]: common.BBB_VALUE,
						},
						end_date: {
							[Op.lt]: currentDate,
						},
					},
				],
			}

			await sessionQueries.updateSession(filterQuery, {
				status: common.COMPLETED_STATUS,
			}) */

			let arrayOfStatus = []
			if (status && status != '') {
				arrayOfStatus = status.split(',')
			}

			let filters = {
				mentor_id: loggedInUserId,
			}
			if (arrayOfStatus.length > 0) {
				// if (arrayOfStatus.includes(common.COMPLETED_STATUS) && arrayOfStatus.length == 1) {
				// 	filters['endDateUtc'] = {
				// 		$lt: moment().utc().format(),
				// 	}
				// } else
				if (arrayOfStatus.includes(common.PUBLISHED_STATUS) && arrayOfStatus.includes(common.LIVE_STATUS)) {
					filters['end_date'] = {
						[Op.gte]: currentDate,
					}
				}

				filters['status'] = arrayOfStatus
			}

			const sessionDetails = await sessionQueries.findAllSessions(page, limit, search, filters)

			if (sessionDetails.count == 0 || sessionDetails.rows.length == 0) {
				return common.successResponse({
					message: 'SESSION_FETCHED_SUCCESSFULLY',
					statusCode: httpStatusCode.ok,
					result: [],
				})
			}

			sessionDetails.rows = await this.sessionMentorDetails(sessionDetails.rows)

			//remove meeting_info details except value and platform
			sessionDetails.rows.forEach((item) => {
				if (item.meeting_info) {
					item.meeting_info = {
						value: item.meeting_info.value,
						platform: item.meeting_info.platform,
					}
				}
			})
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'SESSION_FETCHED_SUCCESSFULLY',
				result: { count: sessionDetails.count, data: sessionDetails.rows },
			})
		} catch (error) {
			throw error
		}
	}
}
