/**
 * name : services/helper/admin.js
 * author : Priyanka Pradeep
 * created-date : 16-Jun-2023
 * Description : Admin Service Helper.
 */

// Dependencies
const usersData = require('@db/users/queries')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utils = require('@generics/utils')
const _ = require('lodash')

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
			let user = await usersData.findOne({ _id: userId })
			if (!user) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let updateParams = {
				deleted: true,
				deletedAt: new Date().getTime(),
				name: 'Anonymous User',
				email: utils.md5Hash(userId) + '@' + 'deletedUser',
			}

			user = _.omit(user, _removeUserKeys())
			const update = _.merge(user, updateParams)

			await usersData.updateOneUser({ _id: userId }, update)
			await utils.redisDel(userId)

			//code for remove user folder from cloud

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'USER_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}

function _removeUserKeys() {
	let removedFields = [
		'gender',
		'designation',
		'location',
		'about',
		'shareLink',
		'areasOfExpertise',
		'experience',
		'lastLoggedInAt',
		'educationQualification',
		'refreshTokens',
		'otpInfo',
		'languages',
		'rating',
		'preferredLanguage',
	]
	return removedFields
}
