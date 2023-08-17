const PostSessionDetail = require('@database/models/index').PostSessionDetail

exports.create = async (data) => {
	try {
		return await PostSessionDetail.create(data)
	} catch (error) {
		return error
	}
}
