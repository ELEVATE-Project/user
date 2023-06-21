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

			let updateParams = _generateUpdateParams(userId)
			const removeKeys = _.omit(user, _removeUserKeys())
			const update = _.merge(removeKeys, updateParams)

			await usersData.findOneAndReplace({ _id: userId }, update)
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
		'about',
		'shareLink',
		'experience',
		'lastLoggedInAt',
		'educationQualification',
		'otpInfo',
		'rating',
		'preferredLanguage',
		'designation',
		'location',
		'areasOfExpertise',
		'languages',
		'educationQualification',
		'refreshTokens',
		'image',
	]
	return removedFields
}

function _generateUpdateParams(userId) {
	const updateUser = {
		deleted: true,
		deletedAt: new Date(),
		name: 'Anonymous User',
		email: {
			address: utils.md5Hash(userId) + '@' + 'deletedUser',
			verified: false,
		},
		refreshTokens: [],
		preferredLanguage: 'en',
		designation: [],
		location: [],
		areasOfExpertise: [],
		languages: [],
	}
	return updateUser
}
