/**
 * name : users.js
 * author : Priyanka Pradeep
 * created-date : 17-July-2023
 * Description : User Service Helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const userQueries = require('@database/queries/users')
const utils = require('@generics/utils')
const roleQueries = require('@database/queries/userRole')
const entitiesQueries = require('@database/queries/entities')
const entityTypeQueries = require('@database/queries/entityType')
const _ = require('lodash')
const { Op } = require('sequelize')

module.exports = class UserHelper {
	/**
	 * update profile
	 * @method
	 * @name update
	 * @param {Object} bodyData - it contains user infomration
	 * @param {string} pageSize -request data.
	 * @param {string} searchText - search text.
	 * @returns {JSON} - update user response
	 */
	static async update(bodyData, id, orgId) {
		bodyData.updated_at = new Date().getTime()
		try {
			if (bodyData.hasOwnProperty('email')) {
				return common.failureResponse({
					message: 'EMAIL_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const filter = {
				status: 'ACTIVE',
			}
			let validationData = await entityTypeQueries.findUserEntityTypesAndEntities(filter, orgId)

			validationData = utils.removeParentEntityTypes(JSON.parse(JSON.stringify(validationData)))

			let res = utils.validateInput(bodyData, validationData, 'users')
			if (!res.success) {
				return common.failureResponse({
					message: 'SESSION_CREATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: res.errors,
				})
			}

			let userModel = await userQueries.getColumns()
			bodyData = utils.restructureBody(bodyData, validationData, userModel)

			const [affectedRows, updatedData] = await userQueries.updateUser({ id: id }, bodyData)
			if (affectedRows == 0) {
				return common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			const redisUserKey = common.redisUserPrefix + id.toString()
			if (await utils.redisGet(redisUserKey)) {
				await utils.redisDel(redisUserKey)
			}
			const processDbResponse = utils.processDbResponse(
				JSON.parse(JSON.stringify(updatedData[0])),
				validationData
			)
			delete processDbResponse.refresh_tokens
			delete processDbResponse.password
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'PROFILE_UPDATED_SUCCESSFULLY',
				result: processDbResponse,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * user details
	 * @method
	 * @name read
	 * @param {string} _id -userId.
	 * @param {string} searchText - search text.
	 * @returns {JSON} - user information
	 */
	static async read(id, internal_access_token = null) {
		try {
			let filter = {}

			if (utils.isNumeric(id)) {
				filter = { id: id }
			} else {
				filter = { share_link: id }
			}

			const redisUserKey = common.redisUserPrefix + id.toString()
			const userDetails = (await utils.redisGet(redisUserKey)) || false
			if (!userDetails) {
				let options = {
					attributes: {
						exclude: ['password', 'refresh_tokens'],
					},
				}
				if (internal_access_token) {
					options.paranoid = false
				}
				const user = await userQueries.findOne(filter, options)
				if (!user) {
					return common.failureResponse({
						message: 'USER_NOT_FOUND',
						statusCode: httpStatusCode.unauthorized,
						responseCode: 'UNAUTHORIZED',
					})
				}

				if (user && user.image) {
					user.image = await utils.getDownloadableUrl(user.image)
				}

				let roles = await roleQueries.findAll(
					{ id: user.roles, status: common.activeStatus },
					{
						attributes: {
							exclude: ['created_at', 'updated_at', 'deleted_at'],
						},
					}
				)

				if (!roles) {
					return common.failureResponse({
						message: 'ROLE_NOT_FOUND',
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}

				user.user_roles = roles

				let validationData = await entityTypeQueries.findUserEntityTypesAndEntities(
					{
						status: 'ACTIVE',
					},
					user.organization_id
				)
				const processDbResponse = utils.processDbResponse(user, validationData)

				if (utils.validateRoleAccess(roles, common.roleMentor)) {
					await utils.redisSet(redisUserKey, processDbResponse)
				}

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FETCHED_SUCCESSFULLY',
					result: processDbResponse ? processDbResponse : {},
				})
			} else {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FETCHED_SUCCESSFULLY',
					result: userDetails ? userDetails : {},
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Share a mentor Profile.
	 * @method
	 * @name share
	 * @param {String} userId - User id.
	 * @returns {JSON} - Shareable profile link.
	 */

	static async share(userId) {
		try {
			let user = await userQueries.findOne({ id: userId }, { attributes: ['share_link'] })

			if (!user) {
				return common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let shareLink = user.share_link
			if (!shareLink) {
				shareLink = utils.md5Hash(userId)
				await userQueries.updateUser({ id: userId }, { share_link: shareLink })
			}
			return common.successResponse({
				message: 'PROFILE_SHARE_LINK_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				result: { shareLink },
			})
		} catch (error) {
			throw error
		}
	}
}
