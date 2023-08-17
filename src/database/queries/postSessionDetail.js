const PostSessionDetail = require('@database/models/index').PostSessionDetail

exports.create = async (data) => {
	try {
		return await PostSessionDetail.create(data)
	} catch (error) {
		return error
	}
}

exports.updateOne = async (filter, update, options = {}) => {
	try {
		const [rowsAffected] = await PostSessionDetail.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})

		return rowsAffected
	} catch (error) {
		return error
	}
}
