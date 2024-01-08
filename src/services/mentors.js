/**
 * name : mentors.js
 * author : Aman
 * created-date : 12-Nov-2021
 * Description : User Profile Service Helper.
 */

// Dependencies
const usersData = require('@db/users/queries')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utilsHelper = require('@generics/utils')

module.exports = class MentorsHelper {
	/**
	 * List of mentors
	 * @method
	 * @name list
	 * @param {string} pageNo -page number.
	 * @param {string} pageSize -request data.
	 * @param {string} searchText - search text.
	 * @param {string} userId - logged in user id.
	 * @returns {Array} - Mentors list
	 */
	static async list(page, limit, search, userId, match) {
		try {
			const mentors = await usersData.searchMentors(page, limit, search, userId, match)

			if (mentors[0].data.length < 1) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'MENTOR_LIST',
					result: {
						data: [],
						count: 0,
					},
				})
			}

			let foundKeys = {}
			let result = []

			/* Required to resolve all promises first before preparing response object else sometime 
                it will push unresolved promise object if you put this logic in below for loop */

			await Promise.all(
				mentors[0].data.map(async (mentor) => {
					/* Assigned image url from the stored location */
					if (mentor.image) {
						mentor.image = await utilsHelper.getDownloadableUrl(mentor.image)
					}
					return mentor
				})
			)

			for (let mentor of mentors[0].data) {
				let firstChar = mentor.name.charAt(0)
				firstChar = firstChar.toUpperCase()

				if (!foundKeys[firstChar]) {
					result.push({
						key: firstChar,
						values: [mentor],
					})
					foundKeys[firstChar] = result.length
				} else {
					let index = foundKeys[firstChar] - 1
					result[index].values.push(mentor)
				}
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MENTOR_LIST',
				result: {
					data: result,
					count: mentors[0].count,
				},
			})
		} catch (error) {
			throw error
		}
	}
}
