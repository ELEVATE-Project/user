/**
 * name : models/systemUsers/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : System Users database operations
 */

// const SystemUsers = require('./model')
const SystemUsers = require('../../database/models/system_users')

module.exports = class SystemUsersData {
	static async findUsersByEmail(email) {
		try {
			const userData = await SystemUsers.findOne({ 'email': email }).lean()
			
			return userData
		} catch (error) {
			return error
		}
	}

	static async create(data) {
		try {
			await new SystemUsers(data).save()
			return true
		} catch (error) {
			return error
		}
	}
}
