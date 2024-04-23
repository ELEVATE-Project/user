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
const responses = require('@helpers/responses')

module.exports = class FilesHelper {
	/**
	 * Get Signed Url
	 * @method
	 * @name getSignedUrl
	 * @param {JSON} req  request body.
	 * @param {string} req.query.fileName - name of the file
	 * @param {string} id  -  userId
	 * @returns {JSON} - Response contains signed url
	 */
	static async getSignedUrl(fileName, id, dynamicPath, isAssetBucket) {
		try {
			let destFilePath
			let cloudBucket
			if (dynamicPath != '') {
				destFilePath = dynamicPath + '/' + fileName
			} else {
				destFilePath = `users/${id}-${new Date().getTime()}-${fileName}`
			}
			// decide on which bucket has to be passed based on api call
			if (isAssetBucket) {
				cloudBucket = process.env.PUBLIC_ASSET_BUCKETNAME
			} else {
				cloudBucket = process.env.CLOUD_STORAGE_BUCKETNAME
			}
			let response = await cloudServices.getSignedUrl(
				cloudBucket,
				destFilePath,
				common.WRITE_ACCESS,
				process.env.SIGNED_URL_EXPIRY_IN_SECONDS
			)
			// let response
			// if (process.env.CLOUD_STORAGE === 'GCP') {
			// 	response = await cloudServices.getGcpSignedUrl(destFilePath)
			// } else if (process.env.CLOUD_STORAGE === 'AWS') {
			// 	response = await cloudServices.getAwsSignedUrl(destFilePath)
			// } else if (process.env.CLOUD_STORAGE === 'AZURE') {
			// 	response = await cloudServices.getAzureSignedUrl(destFilePath)
			// } else if (process.env.CLOUD_STORAGE === 'OCI') {
			// 	response = await cloudServices.getOciSignedUrl(destFilePath)
			// }
			response.destFilePath = destFilePath
			return responses.successResponse({
				message: 'SIGNED_URL_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				responseCode: 'OK',
				result: response,
			})
		} catch (error) {
			throw error
		}
	}

	static async getDownloadableUrl(path, isAssetBucket = false) {
		try {
			console.log('+++++++++', isAssetBucket)
			let bucketName = process.env.CLOUD_STORAGE_BUCKETNAME
			let response
			// downloadable url for public bucket
			if (isAssetBucket || process.env.CLOUD_STORAGE_BUCKET_TYPE != 'private') {
				console.log('yeah inside this +++++++')
				if (isAssetBucket) {
					bucketName = process.env.PUBLIC_ASSET_BUCKETNAME
				}
				response = await utils.getDownloadableUrl(bucketName, path)
			} else {
				response = await cloudServices.getSignedUrl(
					bucketName,
					path,
					common.READ_ACCESS,
					process.env.DOWNLOAD_URL_EXPIRATION_DURATION
				)
				response = response.signedUrl
			}
			console.log('result in services : ', response)
			// let response = await utils.getDownloadableUrl(path, isAssetBucket)
			return responses.successResponse({
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
