const MentorExtension = require('../models/index').MentorExtension // Adjust the path accordingly

module.exports = class MentorExtensionQueries {
	static async createMentorExtension(data) {
		try {
			return await MentorExtension.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async updateMentorExtension(userId, data) {
		try {
			if (data.user_id) {
				delete data['user_id']
			}
			const filter = {
				user_id: userId,
			}
			const [rowsAffected] = await MentorExtension.update(data, {
				where: filter,
			})

			if (rowsAffected > 0) {
				return 'MENTOR_EXTENSION_UPDATED'
			} else {
				return 'MENTOR_EXTENSION_NOT_FOUND'
			}
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
			const rowsAffected = await MentorExtension.destroy({
				where: { user_id: userId },
			})

			return rowsAffected > 0 ? true : false
		} catch (error) {
			throw error
		}
	}
}
