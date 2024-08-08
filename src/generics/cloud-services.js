const common = require('@constants/common')
const utils = require('@generics/utils')
const { cloudClient } = require('@configs/cloud-service')

module.exports = class FilesHelper {
	static async getSignedUrl(bucketName, destFilePath, actionType = common.WRITE_ACCESS, expiryTime = '') {
		try {
			let updatedExpiryTime = await utils.convertExpiryTimeToSeconds(expiryTime)
			const signedUrl = await cloudClient.getSignedUrl(
				bucketName, //BucketName
				destFilePath, //FilePath
				updatedExpiryTime, //Expiry
				actionType //Read[r] or Write[w]
			)

			return {
				signedUrl: Array.isArray(signedUrl) ? signedUrl[0] : signedUrl,
				filePath: destFilePath,
				destFilePath,
			}
		} catch (error) {
			throw error
		}
	}
}
