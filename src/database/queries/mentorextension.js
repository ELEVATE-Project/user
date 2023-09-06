const MentorExtension = require('@database/models/index').MentorExtension // Adjust the path accordingly

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
			const mentor = await MentorExtension.findOne({
				where: { user_id: userId },
				raw: true,
			})
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
	static async removeMentorDetails(userId) {
		try {
			return await MentorExtension.update(
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
