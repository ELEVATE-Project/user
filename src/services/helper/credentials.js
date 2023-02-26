/**
 * name : services/helper/credentials.js
 * author : Ankit Shahu
 * created-date : 25 Feb 2023
 * Description : User Credentials Service Helper.
 */

// Dependencies
const CredentialsData = require('@db/credentials/queries')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utils = require('@generics/utils')

module.exports = class CredentialHelper {
	static async add(bodyData) {
		try {
			let credential = {
				type: bodyData.type,
				userId: bodyData.userId,
				data: bodyData,
			}
			await CredentialsData.add(credential)
			if (await utils.redisGet(bodyData.userId)) {
				await utils.redisDel(bodyData.userId)
			}
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'FORM_CREATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}
