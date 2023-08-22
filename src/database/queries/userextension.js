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
	static async removeMenteeDetails(userId) {
		try {
			return await MenteeExtension.update(
				{
					designation: null,
					area_of_expertise: [],
					education_qualification: [],
					rating: null,
					user_type: null,
					meta: null,
					stats: null,
					tags: [],
					configs: null,
					visibility: null,
					organisation_ids: [],
					external_session_visibility: null,
					external_mentor_visibility: null,
					deleted_at: Date.now(),
				},
				{
					where: {
						user_id: userId,
					},
				}
			)
		} catch (error) {
			console.error('An error occurred:', error)
			throw error
		}
	}
}
