const MentorExtension = require('../models/index').MentorExtension // Adjust the path accordingly

module.exports = class MentorExtensionQueries {
	static async createMentorExtension(data) {
		try {
			return await MentorExtension.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async updateMentorExtension(userId, data, options = {}) {
		try {
			if (data.user_id) {
				delete data['user_id']
			}
			return await MentorExtension.update(data, {
				where: {
					user_id: userId,
				},
				...options,
			})
		} catch (error) {
			throw error
		}
	}

	static async getMentorExtension(userId) {
		try {
			const mentor = await MentorExtension.findOne({ where: { user_id: userId } })
			return mentor
		} catch (error) {
			throw error
		}
	}

	static async deleteMentorExtension(userId) {
		try {
			return await MentorExtension.destroy({
				where: { user_id: userId },
			})
		} catch (error) {
			throw error
		}
	}
}
