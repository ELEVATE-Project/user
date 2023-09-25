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
	static async update(bodyData, id) {
		bodyData.updated_at = new Date().getTime()
		try {
			if (bodyData.hasOwnProperty('email')) {
				return common.failureResponse({
					message: 'EMAIL_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (bodyData.hasOwnProperty(common.location) || bodyData.hasOwnProperty(common.languages)) {
				let values = []
				if (bodyData.hasOwnProperty(common.location)) values.push(common.location)
				if (bodyData.hasOwnProperty(common.languages)) values.push(common.languages)
				if (values.length > 0) {
					const entityTypes = await entityTypeQueries.findAll(
						{ value: values },
						{ attributes: ['id', 'value'] }
					)

					if (!entityTypes) {
						return common.failureResponse({
							message: bodyData.hasOwnProperty(common.location)
								? 'LOCATION_UPDATE_FAILED'
								: 'LANGUAGE_UPDATE_FAILED',
							statusCode: httpStatusCode.bad_request,
							responseCode: 'CLIENT_ERROR',
						})
					}

					for (
						let pointerToEntityTypes = 0;
						pointerToEntityTypes < entityTypes.length;
						pointerToEntityTypes++
					) {
						let entityType = entityTypes[pointerToEntityTypes]
						let entities = await entitiesQueries.findAll(
							{
								value: bodyData[entityType.value],
								entity_type_id: entityType.id,
							},
							{ attributes: ['value'] }
						)

						if (entities.length != bodyData[entityType.value].length) {
							return common.failureResponse({
								message:
									entityType.value == common.location
										? 'LOCATION_UPDATE_FAILED'
										: 'LANGUAGE_UPDATE_FAILED',
								statusCode: httpStatusCode.bad_request,
								responseCode: 'CLIENT_ERROR',
							})
						}
						bodyData[entityType.value] = _.map(entities, function (entity) {
							return entity.value
						})
					}
				}
			}

			let update = await userQueries.updateUser({ id: id }, bodyData)
			if (!update) {
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
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'PROFILE_UPDATED_SUCCESSFULLY',
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
						exclude: ['password', 'location', 'refresh_tokens'],
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

				let isAMentor = false
				if (roles && roles.length > 0) {
					isAMentor = roles.some((role) => role.title === common.roleMentor)
				}

				if (isAMentor) {
					await utils.redisSet(redisUserKey, user)
				}

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FETCHED_SUCCESSFULLY',
					result: user ? user : {},
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
			let user = await userQueries.findOne(
				{ id: userId, role: common.roleMentor },
				{ attributes: ['share_link'] }
			)

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
