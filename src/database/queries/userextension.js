const MenteeExtension = require('../models/index').UserExtension

module.exports = class MenteeExtensionQueries {
	static async createMenteeExtension(data) {
		try {
			return await MenteeExtension.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async updateMenteeExtension(userId, data) {
		try {
			if (data.user_id) {
				delete data['user_id']
			}
			const filter = {
				user_id: userId,
			}
			const [rowsAffected] = await MenteeExtension.update(data, {
				where: filter,
			})

			if (rowsAffected > 0) {
				return 'MENTEE_EXTENSION_UPDATED'
			} else {
				return 'MENTEE_EXTENSION_NOT_FOUND'
			}
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
			const rowsAffected = await MenteeExtension.destroy({
				where: { user_id: userId },
			})

			return rowsAffected > 0 ? true : false
		} catch (error) {
			throw error
		}
	}
}
