/**
 * name : bigBlueButton.js
 * author : Aman Karki
 * created-date : 09-Nov-2021
 * Description : Google cloud services methods.
*/

// Dependencies
const bigBlueButtonUrl = process.env.BIG_BLUE_BUTTON_URL + process.env.BIB_BLUE_BUTTON_BASE_URL;
const crypto = require("crypto");
const request = require("../../generics/requests");
const endpoints = require('../../constants/endpoints');

module.exports = class BigBlueButtonHelper {

    /**
     * Create Meeting.
     * @method
     * @name createMeeting
     * @param {String} meetingId - meeting Id.
     * @param {String} meetingName - meeting name.
     * @param {String} attendeePW - Attendee Password.
     * @param {String} moderatorPW - Moderator Password.
     * @returns {String} - Meeting success message.
    */

    static async createMeeting(meetingId,meetingName,attendeePW,moderatorPW) {
        try {
            
            let endMeetingCallBackUrl = process.env.MEETING_END_CALLBACK_EVENTS + "%2F" + meetingId;

            meetingName = encodeURI(meetingName);
            let query = "name=" + meetingName + "&meetingID=" + meetingId + "&record=true" + "&autoStartRecording=true" + "&meta_endCallbackUrl=" + endMeetingCallBackUrl + "&attendeePW=" + attendeePW + "&moderatorPW=" + moderatorPW;
            let checkSumGeneration = "create" + query + process.env.BIG_BLUE_BUTTON_SECRET_KEY;
            const checksum = this.generateCheckSum(checkSumGeneration);

            const createUrl = bigBlueButtonUrl + endpoints.CREATE_MEETING + "?" + query + "&checksum=" + checksum;
            let response = await request.get(createUrl);
            return response;
        } catch (error) {
            throw error;
        }
    }

     /**
     * Join Meeting as Moderator.
     * @method
     * @name joinMeetingAsModerator
     * @param {String} meetingId - meeting Id.
     * @param {String} mentorName - mentor name.
     * @param {String} moderatorPW - Moderator Password.
     * @returns {String} - Moderator Meeting url.
    */

    static async joinMeetingAsModerator(meetingId,mentorName,moderatorPW) {
        try {

            mentorName = encodeURI(mentorName);
            let query = "meetingID=" + meetingId + "&password=" + moderatorPW + "&fullName=" + mentorName;
            let checkSumGeneration = "join" + query + process.env.BIG_BLUE_BUTTON_SECRET_KEY;
            const checksum = this.generateCheckSum(checkSumGeneration);

            const joinUrl = bigBlueButtonUrl + endpoints.JOIN_MEETING + "?" + query + "&checksum=" + checksum;
            return joinUrl;

        } catch (error) {
            throw error;
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

    static async joinMeetingAsAttendee(meetingId,menteeName,menteePW) {
        try {

            menteeName = encodeURI(menteeName);
            let query = "meetingID=" + meetingId + "&password=" + menteePW + "&fullName=" + menteeName;
            let checkSumGeneration = "join" + query + process.env.BIG_BLUE_BUTTON_SECRET_KEY;
            const checksum = this.generateCheckSum(checkSumGeneration);

            const joinUrl = bigBlueButtonUrl + endpoints.JOIN_MEETING + "?" + query + "&checksum=" + checksum;
            return joinUrl;

        } catch (error) {
            throw error;
        }
    }

     /**
     * Get meeting recordings.
     * @method
     * @name getRecordings
     * @param {String} meetingId - meeting Id.
     * @returns {JSON} - Recording response.
    */

    static async getRecordings(meetingId) {
        try {

            let checkSumGeneration = "getRecordingsmeetingID=" + meetingId + process.env.BIG_BLUE_BUTTON_SECRET_KEY;
            const checksum = this.generateCheckSum(checkSumGeneration);

            const meetingInfoUrl = bigBlueButtonUrl + endpoints.GET_RECORDINGS + "?meetingID=" + meetingId + "&checksum=" + checksum;
            let response = await request.get(meetingInfoUrl);
            return response;

        } catch (error) {
            throw error;
        }
    }

     /**
     * Generate security checksum.
     * @method
     * @name generateCheckSum
     * @param {String} queryHash - Query hash.
     * @returns {Number} - checksum key.
    */

    static generateCheckSum(queryHash) {
        var shasum = crypto.createHash('sha1');
        shasum.update(queryHash);
        const checksum = shasum.digest('hex');
        return checksum;
    }
}