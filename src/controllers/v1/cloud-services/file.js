/**
 * name : gcp.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : Google cloud services methods.
 */

const filesService = require('@services/files')

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
			const signedUrlResponse = await filesService.getSignedUrl(
				req.query.fileName,
				req.decodedToken.id,
				req.query.dynamicPath ? req.query.dynamicPath : '',
				req.query.public && req.query.public == 'true' ? true : false
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
			return await filesService.getDownloadableUrl(
				req.query.filePath,
				req.query.public && req.query.public == 'true' ? true : false
			)
		} catch (error) {
			return error
		}
	}

	/**
	 * Get sample bulk upload csv downloadable Url
	 * @method
	 * @name getSampleCSV
	 * @param {JSON} req  request body.
	 * @returns {JSON} Response with status message and result.
	 */
	async getSampleCSV(req) {
		try {
			const downloadUrlResponse = await filesService.getDownloadableUrl(process.env.SAMPLE_CSV_FILE_PATH)
			return downloadUrlResponse
		} catch (error) {
			return error
		}
	}
}
