/**
 * name : credentials.js
 * author : Ankit Shahu
 * created-date : 25 Feb 2023
 * Description : User Credentials
 */

// Dependencies
const credentialHelper = require('@services/helper/credentials')
module.exports = class Mentors {
	async add(req, res) {
		const params = req.body
		try {
			const addCredentials = await credentialHelper.add(params)
			return addCredentials
		} catch (error) {
			return error
		}
	}
}
