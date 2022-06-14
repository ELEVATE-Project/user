/**
 * name : models/entities/query
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Users entities database operations
 */

// Dependencies
const UserEntities = require('./model')

module.exports = class UserEntityData {
	static async createEntity(data) {
		try {
			await new UserEntities(data).save()
			return true
		} catch (error) {
			return error
		}
	}

	static async findOneEntity(filter, projection = {}) {
		try {
			const userEntityData = await UserEntities.findOne(filter, projection)
			return userEntityData
		} catch (error) {
			return error
		}
	}

	static async findAllEntities(filter, projection = {}) {
		try {
			const userEntitiesData = await UserEntities.find(filter, projection)
			return userEntitiesData
		} catch (error) {
			return error
		}
	}

	static async updateOneEntity(filter, update, options = {}) {
		try {
			const res = await UserEntities.updateOne(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				resolve('ENTITY_UPDATED')
			} else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
				return 'ENTITY_ALREADY_EXISTS'
			} else {
				return 'ENTITY_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}
}
