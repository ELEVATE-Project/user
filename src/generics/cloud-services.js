/**
 * name : generics/files-helper.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : cloud services helpers methods.
 */

// Dependencies
const common = require('@constants/common')
const { cloudClient } = require('@configs/cloud-service')

module.exports = class FilesHelper {
	static async getSignedUrl(bucketName, destFilePath, actionType = common.WRITE_ACCESS, expiryTime = '') {
		try {
			const signedUrl = await cloudClient.getSignedUrl(
				bucketName, //BucketName
				destFilePath, //FilePath
				expiryTime, //Expiry
				actionType //Read[r] or Write[w]
			)

			return {
				signedUrl: signedUrl[0],
				filePath: destFilePath,
			}
		} catch (error) {
			throw error
		}
	}
}
