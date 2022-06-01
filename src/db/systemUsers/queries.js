/**
 * name : models/systemUsers/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : System Users database operations
 */

const SystemUsers = require('./model')

module.exports = class SystemUsersData {
	static findUsersByEmail(email) {
		return new Promise(async (resolve, reject) => {
			try {
				const userData = await SystemUsers.findOne({ 'email.address': email }).lean()
				resolve(userData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static create(data) {
		return new Promise(async (resolve, reject) => {
			try {
				await new SystemUsers(data).save()
				resolve(true)
			} catch (error) {
				reject(error)
			}
		})
	}
}
