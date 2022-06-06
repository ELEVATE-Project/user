/**
 * name : gcp.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : Google cloud services methods.
 */

const filesHelper = require('@services/helper/files')

module.exports = class File {
	/**
	 * Get Signed Url
	 * @method
	 * @name getSignedUrl
	 * @param {JSON} req  request body.
	 * @param {string} req.query.fileName  name of the file
	 * @param {string} req.decodedToken._id  it contains userId
	 * @returns {JSON} Response with status message and result .
	 */
	async getSignedUrl(req) {
		try {
			const signedUrlResponse = await filesHelper.getSignedUrl(
				req.query.fileName,
				req.decodedToken._id,
				req.query.dynamicPath ? req.query.dynamicPath : ''
			)
			return signedUrlResponse
		} catch (error) {
			return error
		}
	}

	/**
	 * Get downlodable Url
	 * @method
	 * @name getDownloadableUrl
	 * @param {JSON} req  request body.
	 * @returns {JSON} Response with status message and result.
	 */
	async getDownloadableUrl(req) {
		try {
			const downlopadUrlResponse = await filesHelper.getDownloadableUrl(req.query.filePath)
			return downlopadUrlResponse
		} catch (error) {
			return error
		}
	}
}
