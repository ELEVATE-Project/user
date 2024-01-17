/**
 * name : models/entities/query
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Users entities database operations
 */

const ObjectId = require('mongoose').Types.ObjectId
const Entities = require('./model')

module.exports = class UserEntityData {
	static async createEntity(data) {
		try {
			await new Entities(data).save()
			return true
		} catch (error) {
			return error
		}
	}

	static async findOneEntity(type, value) {
		try {
			const filter = { type, value }
			const userEntityData = await Entities.findOne(filter)
			return userEntityData
		} catch (error) {
			return error
		}
	}
	static async findOneEntityType(type) {
		try {
			const filter = { type }
			const userEntityData = await Entities.findOne(filter)
			return userEntityData
		} catch (error) {
			return error
		}
	}
	static async findAllEntities(filter) {
		try {
			const projection = { value: 1, label: 1, _id: 0 }
			const userEntitiesData = await Entities.find(filter, projection)
			return userEntitiesData
		} catch (error) {
			return error
		}
	}

	static async updateOneEntity(_id, update, options = {}) {
		try {
			update.updatedBy = ObjectId(update.updatedBy)
			const filter = {
				_id: ObjectId(_id),
			}
			const res = await Entities.updateOne(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				return 'ENTITY_UPDATED'
			} else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
				return 'ENTITY_ALREADY_EXISTS'
			} else {
				return 'ENTITY_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}

	static async deleteOneEntityType(id) {
		try {
			const update = { deleted: true }
			const filter = { _id: ObjectId(id) }

			const [rowsAffected] = await Entity.update(update, {
				where: filter,
				paranoid: true,
			})

			if (rowsAffected > 0) {
				return 'ENTITY_UPDATED'
			} else {
				return 'ENTITY_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}

	static async findOne(_id) {
		try {
			const filter = {
				_id: ObjectId(_id),
			}
			return await Entities.findOne(filter)
		} catch (error) {
			return error
		}
	}
}
