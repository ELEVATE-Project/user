/**
 * name : bigBlueButton.js
 * author : Aman Karki
 * created-date : 09-Nov-2021
 * Description : bigBlueButton services methods.
 */

// Dependencies
const bigBlueButtonUrl = process.env.BIG_BLUE_BUTTON_URL + process.env.BIB_BLUE_BUTTON_BASE_URL
const endpoints = require('@constants/endpoints')
const utils = require('@generics/utils')

module.exports = class BigBlueButtonHelper {
	/**
	 * Join Meeting as Moderator.
	 * @method
	 * @name joinMeetingAsModerator
	 * @param {String} meetingId - meeting Id.
	 * @param {String} mentorName - mentor name.
	 * @param {String} moderatorPW - Moderator Password.
	 * @returns {String} - Moderator Meeting url.
	 */

	static async joinMeetingAsModerator(meetingId, mentorName, moderatorPW) {
		try {
			mentorName = encodeURI(mentorName)
			let query = 'meetingID=' + meetingId + '&password=' + moderatorPW + '&fullName=' + mentorName
			let checkSumGeneration = 'join' + query + process.env.BIG_BLUE_BUTTON_SECRET_KEY
			const checksum = utils.generateCheckSum(checkSumGeneration)

			const joinUrl = bigBlueButtonUrl + endpoints.JOIN_MEETING + '?' + query + '&checksum=' + checksum
			return joinUrl
		} catch (error) {
			throw error
		}
	}

	/**
	 * Join Meeting as Attendee.
	 * @method
	 * @name joinMeetingAsAttendee
	 * @param {String} meetingId - meeting Id.
	 * @param {String} menteeName - mentee name.
	 * @param {String} menteePW - Mentee Password.
	 * @returns {String} - Mentee Meeting url.
	 */

	static async joinMeetingAsAttendee(meetingId, menteeName, menteePW) {
		try {
			menteeName = encodeURI(menteeName)
			let query = 'meetingID=' + meetingId + '&password=' + menteePW + '&fullName=' + menteeName
			let checkSumGeneration = 'join' + query + process.env.BIG_BLUE_BUTTON_SECRET_KEY
			const checksum = utils.generateCheckSum(checkSumGeneration)

			const joinUrl = bigBlueButtonUrl + endpoints.JOIN_MEETING + '?' + query + '&checksum=' + checksum
			return joinUrl
		} catch (error) {
			throw error
		}
	}
}
