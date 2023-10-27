/**
 * name : admin.js
 * author : Priyanka Pradeep
 * created-date : 16-Jun-2023
 * Description : Admin Service Helper.
 */

// Dependencies

const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utils = require('@generics/utils')
const _ = require('lodash')
const userQueries = require('@database/queries/users')
const roleQueries = require('@database/queries/userRole')
const organizationQueries = require('@database/queries/organization')

module.exports = class AdminHelper {
	/**
	 * Delete User
	 * @method
	 * @name deleteUser
	 * @param {string} userId -delete user Id.
	 * @returns {JSON} - delete user response
	 */
	static async deleteUser(userId) {
		try {
			let user = await userQueries.findByPk(userId)
			if (!user) {
				return common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let updateParams = _generateUpdateParams(userId)
			const removeKeys = _.omit(user, _removeUserKeys())
			const update = _.merge(removeKeys, updateParams)

			await userQueries.updateUser({ id: userId }, update)
			await utils.redisDel(common.redisUserPrefix + userId.toString())

			//code for remove user folder from cloud

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * create admin users
	 * @method
	 * @name create
	 * @param {Object} bodyData - user create information
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @returns {JSON} - returns created user information
	 */
	static async create(bodyData) {
		try {
			const email = bodyData.email.toLowerCase()
			const user = await userQueries.findOne({ email: email })

			if (user) {
				return common.failureResponse({
					message: 'ADMIN_USER_ALREADY_EXISTS',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let role = await roleQueries.findOne({ title: common.roleAdmin })
			if (!role) {
				return common.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			bodyData.roles = [role.id]

			if (!bodyData.organization_id) {
				let organization = await organizationQueries.findOne(
					{ code: process.env.DEFAULT_ORGANISATION_CODE },
					{ attributes: ['id'] }
				)
				bodyData.organization_id = organization.id
			}

			bodyData.password = utils.hashPassword(bodyData.password)
			await userQueries.create(bodyData)

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'USER_CREATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * login admin user
	 * @method
	 * @name login
	 * @param {Object} bodyData - user login data.
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @returns {JSON} - returns login response
	 */
	static async login(bodyData) {
		try {
			let user = await userQueries.findOne({ email: bodyData.email.toLowerCase() })

			if (!user) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const isPasswordCorrect = utils.comparePassword(bodyData.password, user.password)
			if (!isPasswordCorrect) {
				return common.failureResponse({
					message: 'PASSWORD_INVALID',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let roles = await roleQueries.findAll(
				{ id: user.roles },
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

			const tokenDetail = {
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					organization_id: user.organization_id,
					roles: roles,
				},
			}

			user.user_roles = roles

			const accessToken = utils.generateToken(tokenDetail, process.env.ACCESS_TOKEN_SECRET, '1d')
			const refreshToken = utils.generateToken(tokenDetail, process.env.REFRESH_TOKEN_SECRET, '183d')

			delete user.password
			const result = { access_token: accessToken, refresh_token: refreshToken, user }

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'LOGGED_IN_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Add admin to organization
	 * @method
	 * @name addOrgAdmin
	 * @param {string} userId - user Id.
	 * @param {string} organizationId -organization Id.
	 * @returns {JSON} - delete user response
	 */
	static async addOrgAdmin(userId, organizationId, loggedInUserId) {
		try {
			let user = await userQueries.findByPk(userId)
			if (!user) {
				return common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let organization = await organizationQueries.findByPk(organizationId)
			if (!organization) {
				return common.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const orgAdmins = _.uniq([...(organization.org_admin || []), userId])

			const orgRowsAffected = await organizationQueries.update(
				{ id: organizationId },
				{
					org_admin: orgAdmins,
					updated_by: loggedInUserId,
				}
			)
			if (orgRowsAffected == 0) {
				return common.failureResponse({
					message: 'ORG_ADMIN_MAPPING_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let role = await roleQueries.findOne({ title: common.roleOrgAdmin }, { attributes: ['id'] })
			if (!role) {
				return common.failureResponse({
					message: 'ROLE_NOT_FOUND',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const roles = _.uniq([...(user.roles || []), role.id])
			await userQueries.updateUser(
				{ id: userId, organization_id: organizationId },
				{
					roles,
				}
			)

			const roleData = await roleQueries.findAll(
				{ id: roles, status: common.activeStatus },
				{
					attributes: {
						exclude: ['created_at', 'updated_at', 'deleted_at'],
					},
				}
			)

			const result = {
				user_id: userId,
				organization_id: organizationId,
				user_roles: roleData,
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_ADMIN_MAPPED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Deactivate Organization
	 * @method
	 * @name deactivateOrg
	 * @param {Number} id - org id
	 * @param {Object} loggedInUserId - logged in user id
	 * @returns {JSON} - Deactivated user count
	 */
	static async deactivateOrg(id, loggedInUserId) {
		try {
			let rowsAffected = await organizationQueries.update(
				{
					id,
				},
				{
					status: common.inactiveStatus,
					updated_by: loggedInUserId,
				}
			)

			if (rowsAffected == 0) {
				return common.failureResponse({
					message: 'STATUS_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			//deactivate all users in org
			const modifiedCount = await userQueries.updateUser(
				{
					organization_id: id,
				},
				{
					status: common.inactiveStatus,
					updated_by: loggedInUserId,
				}
			)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_DEACTIVATED',
				result: {
					deactivated_users: modifiedCount,
				},
			})
		} catch (error) {
			throw error
		}
	}
}

function _removeUserKeys() {
	let removedFields = [
		'gender',
		'about',
		'share_link',
		'last_logged_in_at',
		'preferred_language',
		'location',
		'languages',
		'refresh_tokens',
		'image',
	]
	return removedFields
}

function _generateUpdateParams(userId) {
	const updateUser = {
		deleted_at: new Date(),
		name: 'Anonymous User',
		email: utils.md5Hash(userId) + '@' + 'deletedUser',
		refresh_tokens: [],
		preferred_language: 'en',
		location: [],
		languages: [],
	}
	return updateUser
}
