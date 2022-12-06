/**
 * name : models/forms/query
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Users database operations
 */
const Forms = require('./model')

module.exports = class FormsData {
	static async createForm(data) {
		try {
			await new Forms(data).save()
			return true
		} catch (error) {
			return error
		}
	}

	static async findOneForm(filter) {
		try {
			const projection = {}

			const formData = await Forms.findOne(filter, projection)
			return formData
		} catch (error) {
			return error
		}
	}

	static async updateOneForm(filter, update, options = {}) {
		try {
			const res = await Forms.updateOne(filter, update, options)
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
	static async findAllTypeFormVersion() {
		try {
			const projection = {
				_id: 1,
				type: 1,
				__v: 1,
			}
			const formData = await Forms.find({}, projection)
			return formData
		} catch (error) {
			return error
		}
	}
}
