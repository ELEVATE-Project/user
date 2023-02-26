/**
 * name : models/credentials
 * author : Ankit Shahu
 * Date : 25 FEB 2023
 * Description : credentials operations
 */

const cred = require('./model')

module.exports = class CredentialsData {
	static async add(data) {
		try {
			await new cred(data).save()
			return true
		} catch (error) {
			return error
		}
	}

	static async find(filter, projection = {}) {
		try {
			const credential = await cred.find(filter, projection)
			return credential
		} catch (error) {
			return error
		}
	}
}
