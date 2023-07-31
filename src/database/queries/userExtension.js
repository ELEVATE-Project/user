const UserExtension = require('../models/index').UserExtension

exports.create = async (data) => {
	try {
		return await UserExtension.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		const res = await UserExtension.findOne({
			where: filter,
			...options,
			raw: true,
		})
		return res
	} catch (error) {
		return error
	}
}

exports.updateOne = async (filter, update, options = {}) => {
	try {
		const [rowsAffected] = await UserExtension.update(update, {
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
		return error
	}
}
