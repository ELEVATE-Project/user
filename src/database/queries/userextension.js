const MenteeExtension = require('../models/index').UserExtension

module.exports = class MenteeExtensionQueries {
	static async createMenteeExtension(data) {
		try {
			return await MenteeExtension.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async updateMenteeExtension(userId, data, options = {}) {
		try {
			if (data.user_id) {
				delete data['user_id']
			}
			return await MenteeExtension.update(data, {
				where: {
					user_id: userId,
				},
				...options,
			})
		} catch (error) {
			throw error
		}
	}

	static async getMenteeExtension(userId) {
		try {
			const mentee = await MenteeExtension.findOne({ where: { user_id: userId } })
			return mentee
		} catch (error) {
			throw error
		}
	}

	static async deleteMenteeExtension(userId) {
		try {
			return await MenteeExtension.destroy({
				where: { user_id: userId },
			})
		} catch (error) {
			throw error
		}
	}
}
