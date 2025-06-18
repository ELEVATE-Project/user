const Feature = require('@database/models/index').Feature

module.exports = class FeatureData {
	static async create(data) {
		try {
			return await Feature.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async findByCode(code) {
		try {
			return await Feature.findByPk(code)
		} catch (error) {
			throw error
		}
	}

	static async findAndCountAll(filter, attributes, options) {
		try {
			const data = await Feature.findAndCountAll({
				where: filter,
				attributes,
				options,
			})
			return data
		} catch (error) {
			throw error
		}
	}

	static async update(filter, updatedata) {
		try {
			const [rowsUpdated, [updatedFeature]] = await Feature.update(updatedata, {
				where: filter,
				returning: true,
				raw: true,
			})
			return updatedFeature
		} catch (error) {
			throw error
		}
	}

	static async deleteByCode(code) {
		try {
			const deletedRows = await Feature.destroy({
				where: { code: code },
				individualHooks: true,
			})
			return deletedRows
		} catch (error) {
			throw error
		}
	}

	static async findAll(filter, attributes, options) {
		try {
			const data = await Feature.findAll({
				where: filter,
				attributes,
				options,
			})
			return data
		} catch (error) {
			throw error
		}
	}
}
