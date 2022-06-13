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
			console.log(error, '<]]]]]]]]]]]]]')
			return error
		}
	}

	static async findOneForm(type, subType, action, ver, templateName) {
		const filter = { type, subType, action, ver, 'data.templateName': templateName }
		const projection = {}

		try {
			const formData = await Forms.findOne(filter, projection)
			return formData
		} catch (error) {
			console.log(error)
			return error
		}
	}

	static async updateOneForm(update, options = {}) {
		const filter = {
			type: update.type,
			subType: update.subType,
			action: update.action,
			ver: update.ver,
			'data.templateName': update.data.templateName,
		}

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
}
