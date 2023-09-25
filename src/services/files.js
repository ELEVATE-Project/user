/**
 * name : files.js
 * author : Aman Gupta
 * created-date : 03-Nov-2021
 * Description : files helper.
 */

// Dependencies
const cloudServices = require('@generics/cloud-services')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const utils = require('@generics/utils')

module.exports = class FilesHelper {
	/**
	 * Get Signed Url
	 * @method
	 * @name getSignedUrl
	 * @param {JSON} req  request body.
	 * @param {string} req.query.fileName - name of the file
	 * @param {string} _id  -  userId
	 * @returns {JSON} - Response contains signed url
	 */
	static async getSignedUrl(fileName, _id, dynamicPath) {
		try {
			let destFilePath
			if (dynamicPath != '') {
				destFilePath = dynamicPath + '/' + fileName
			} else {
				destFilePath = `users/${_id}-${new Date().getTime()}-${fileName}`
			}

			let response
			if (process.env.CLOUD_STORAGE === 'GCP') {
				response = await cloudServices.getGcpSignedUrl(destFilePath)
			} else if (process.env.CLOUD_STORAGE === 'AWS') {
				response = await cloudServices.getAwsSignedUrl(destFilePath)
			} else if (process.env.CLOUD_STORAGE === 'AZURE') {
				response = await cloudServices.getAzureSignedUrl(destFilePath)
			} else if (process.env.CLOUD_STORAGE === 'OCI') {
				response = await cloudServices.getOciSignedUrl(destFilePath)
			}
			response.destFilePath = destFilePath
			return common.successResponse({
				message: 'SIGNED_URL_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				responseCode: 'OK',
				result: response,
			})
		} catch (error) {
			throw error
		}
	}

	static async getDownloadableUrl(path) {
		try {
			let response = await utils.getDownloadableUrl(path)
			return common.successResponse({
				message: 'DOWNLOAD_URL_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				responseCode: 'OK',
				result: response,
			})
		} catch (error) {
			throw error
		}
	}
}
