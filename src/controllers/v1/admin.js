/**
 * name : admin.js
 * author : Priyanka Pradeep
 * created-date : 16-Jun-2023
 * Description : User admin
 */

// Dependencies
const adminService = require('@services/admin')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utilsHelper = require('@generics/utils')
const responses = require('@helpers/responses')

module.exports = class Admin {
	/**
	 * Delete user
	 * @method
	 * @name deleteUser
	 * @param {String} req.params.id -userId.
	 * @returns {JSON} - delete user response
	 */

	async deleteUser(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const user = await adminService.deleteUser(req.params.id)
			return user
		} catch (error) {
			return error
		}
	}

	/**
	 * create admin users
	 * @method
	 * @name create
	 * @param {Object} bodyData - user create information
	 * @param {string} bodyData.email - email.
	 * @param {string} bodyData.password - email.
	 * @param {string} bodyData.secret_code - secret code for admin creation.
	 * @param {string} headers.internal_access_token - internal access token
	 * @returns {JSON} - returns created user information
	 */

	async create(req) {
		try {
			if (req.body.secret_code != process.env.ADMIN_SECRET_CODE) {
				throw responses.failureResponse({
					message: 'INVALID_SECRET_CODE',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const createdAccount = await adminService.create(req.body)
			return createdAccount
		} catch (error) {
			return error
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

	async login(req) {
		try {
			const device_info = req.headers && req.headers['device-info'] ? req.headers['device-info'] : {}
			const loggedInAccount = await adminService.login(req.body, device_info)
			return loggedInAccount
		} catch (error) {
			return error
		}
	}

	/**
	 * Add admin to organization
	 * @method
	 * @name addOrgAdmin
	 * @param {Object} bodyData - organization and user data.
	 * @param {string} bodyData.user_id - org admin id.
	 * @param {string} bodyData.organization_id - organization id.
	 * @returns {JSON} - returns user response
	 */

	async addOrgAdmin(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const orgAdminCreation = await adminService.addOrgAdmin(
				req.body?.user_id,
				req.body.organization_id,
				req.decodedToken.id,
				req.body?.email
			)
			return orgAdminCreation
		} catch (error) {
			return error
		}
	}

	/**
	 * Deactivate Org
	 * @method
	 * @name deactivateOrg
	 * @param {String} req.params.id - org Id.
	 * @returns {JSON} - deactivated org response
	 */
	async deactivateOrg(req) {
		try {
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ADMIN_ROLE)) {
				throw responses.failureResponse({
					message: 'USER_IS_NOT_A_ADMIN',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const result = await adminService.deactivateOrg(req.params.id, req.decodedToken.id)
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
			if (!utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ADMIN_ROLE)) {
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

			const result = await adminService.deactivateUser(req.body, req.decodedToken.id)

			return result
		} catch (error) {
			return error
		}
	}

	async triggerViewRebuild(req) {
		try {
			if (!req.decodedToken.roles.some((role) => role.title === common.ADMIN_ROLE)) {
				return responses.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			const userDelete = await adminService.triggerViewRebuild(req.decodedToken)
			return userDelete
		} catch (error) {
			return error
		}
	}
	async triggerPeriodicViewRefresh(req) {
		try {
			if (!req.decodedToken.roles.some((role) => role.title === common.ADMIN_ROLE)) {
				return responses.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			return await adminService.triggerPeriodicViewRefresh(req.decodedToken)
		} catch (err) {
			console.log(err)
		}
	}
	async triggerViewRebuildInternal(req) {
		try {
			return await adminService.triggerViewRebuild()
		} catch (error) {
			return error
		}
	}
	async triggerPeriodicViewRefreshInternal(req) {
		try {
			return await adminService.triggerPeriodicViewRefreshInternal(req.query.model_name)
		} catch (err) {
			console.log(err)
		}
	}
}
