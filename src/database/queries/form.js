const Form = require('../models/index').Form

module.exports = class FormsData {
	static async createForm(data) {
		try {
			let form = await Form.create(data, { returning: true })
			return form
		} catch (error) {
			throw error
		}
	}

	static async findOneForm(filter) {
		try {
			const formData = await Form.findOne({
				where: filter,
				raw: true,
			})
			return formData
		} catch (error) {
			throw error
		}
	}

	static async updateOneForm(filter, update, options = {}) {
		try {
			const [rowsAffected] = await Form.update(update, {
				where: filter,
				...options,
				individualHooks: true, // Pass 'individualHooks: true' option to ensure proper triggering of 'beforeUpdate' hook.
			})

			if (rowsAffected > 0) {
				return 'ENTITY_UPDATED'
			} else {
				return 'ENTITY_NOT_FOUND'
			}
		} catch (error) {
			throw error
		}
	}

	static async findAllTypeFormVersion() {
		try {
			const formData = await Form.findAll({
				attributes: ['id', 'type', 'version'],
			})
			return formData
		} catch (error) {
			throw error
		}
	}
}
