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
let innovationBaseUrl = process.env.INNOVATION_URL
var axios = require('axios')
const endpoints = require('@constants/endpoints')
const UserData = require('@db/users/queries')
const ProfileHelper = require('@services/helper/profile')
module.exports = class CredentialHelper {
	static async add(bodyData) {
		try {
			let credential = {
				type: bodyData.type,
				userId: bodyData.userId,
				data: bodyData,
			}

			if (bodyData.documentType === 'aadhar' || bodyData.documentType === 'adhaar') {
				let userName = await UserData.findOne({ _id: bodyData.userId }, { name: 1 })
				bodyData.name = userName.name
				let data = JSON.stringify({
					...bodyData,
				})

				let config = {
					method: 'post',
					maxBodyLength: Infinity,
					url: innovationBaseUrl + endpoints.AADHAR_VERIFY,
					headers: {
						'Content-Type': 'application/json',
					},
					data: data,
				}
				axios(config)
					.then(async function (response) {
						if (response.data) {
							await ProfileHelper.update({ isMentorVerified: true }, bodyData.userId)
						}
					})
					.catch(function (error) {
						console.log(error)
					})
			}
			await CredentialsData.add(credential)
			if (await utils.redisGet(bodyData.userId)) {
				await utils.redisDel(bodyData.userId)
			}
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'CREDENTIAL_CREATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}
}
