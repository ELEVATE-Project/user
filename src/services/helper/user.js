/**
 * name : services/helper/users.js
 * author : Priyanka Pradeep
 * created-date : 17-July-2023
 * Description : User Service Helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const userQueries = require('@database/queries/users')
const utils = require('@generics/utils')

module.exports = class UserHelper {
	/**
	 * update profile
	 * @method
	 * @name update
	 * @param {Object} bodyData - it contains profile infomration
	 * @param {string} pageSize -request data.
	 * @param {string} searchText - search text.
	 * @returns {JSON} - update profile response
	 */
	static async update(bodyData, _id) {
		bodyData.updatedAt = new Date().getTime()
		try {
			if (bodyData.hasOwnProperty('email')) {
				return common.failureResponse({
					message: 'EMAIL_UPDATE_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let update = await usersData.updateOneUser({ _id: ObjectId(_id), deleted: false }, bodyData)
			if (!update) {
				return common.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			if (await utils.redisGet(_id)) {
				await utils.redisDel(_id)
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'PROFILE_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * user details
	 * @method
	 * @name read
	 * @param {string} _id -userId.
	 * @param {string} searchText - search text.
	 * @returns {JSON} - user information
	 */
	static async read(id) {
		const projection = ['password', 'location', 'refresh_token']
		try {
			let filter = {}

			if (id) {
				filter = { where: { id: id } }
			} else {
				filter = { where: { shareLink: id } }
			}

			const userDetails = (await utils.redisGet(id)) || false
			if (!userDetails) {
				const user = await userQueries.findOne({
					filter,
					attributes: {
						exclude: projection,
					},
				})

				if (user && user.image) {
					user.image = await utils.getDownloadableUrl(user.image)
				}
				if (user.role === common.roleMentor) {
					await utils.redisSet(id, user)
				}
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FETCHED_SUCCESSFULLY',
					result: user ? user : {},
				})
			} else {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'PROFILE_FETCHED_SUCCESSFULLY',
					result: userDetails ? userDetails : {},
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Share a mentor Profile.
	 * @method
	 * @name share
	 * @param {String} userId - User id.
	 * @returns {JSON} - Shareable profile link.
	 */

	static async share(userId) {
		try {
			const user = await userQueries.findOne({
				where: { id: userId },
				attributes: ['role', 'deleted'],
			})
			if (!user) {
				return common.failureResponse({
					message: 'USER_DOESNOT_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			if (user.deleted) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			let shareLink = user.shareLink
			if (!shareLink) {
				shareLink = utils.md5Hash(userId)
				await userQueries.updateUser({ share_link: shareLink }, { where: { id: userId } })
			}
			return common.successResponse({
				message: 'PROFILE_SHARE_LINK_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				result: { shareLink },
			})
		} catch (error) {
			throw error
		}
	}

	static async ratingCalculation(ratingData) {
		let mentorDetails = await usersData.findOne({ _id: ObjectId(ratingData.mentorId) })
		let updateData
		if (mentorDetails.rating && mentorDetails.rating.average) {
			let totalRating = parseFloat(ratingData.value)
			let ratingBreakup = []
			if (mentorDetails.rating.breakup && mentorDetails.rating.breakup.length > 0) {
				let breakupFound = false
				ratingBreakup = await Promise.all(
					mentorDetails.rating.breakup.map((breakupData) => {
						totalRating = totalRating + parseFloat(breakupData.star * breakupData.votes)

						if (breakupData['star'] == Number(ratingData.value)) {
							breakupFound = true
							return {
								star: breakupData.star,
								votes: breakupData.votes + 1,
							}
						} else {
							return breakupData
						}
					})
				)

				if (!breakupFound) {
					ratingBreakup.push({
						star: Number(ratingData.value),
						votes: 1,
					})
				}
			}

			let totalVotesCount = mentorDetails.rating.votes + 1
			let avg = Math.round(parseFloat(totalRating) / totalVotesCount)

			updateData = {
				rating: {
					average: avg,
					votes: totalVotesCount,
					breakup: ratingBreakup,
				},
			}
		} else {
			updateData = {
				rating: {
					average: parseFloat(ratingData.value),
					votes: 1,
					breakup: [
						{
							star: Number(ratingData.value),
							votes: 1,
						},
					],
				},
			}
		}
		await usersData.updateOneUser({ _id: ObjectId(ratingData.mentorId) }, updateData)
		if (await utils.redisGet(ratingData.mentorId)) {
			await utils.redisDel(ratingData.mentorId)
		}
		return
	}
}
