/**
 * name : services/helper/mentors.js
 * author : Aman
 * created-date : 12-Nov-2021
 * Description : User Profile Service Helper.
 */

const usersData = require("../../db/users/queries");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const httpStatusCode = require("../../generics/http-status");
const fileHelper = require('../../generics/files-helper');

module.exports = class MentorsHelper {

    static async list(page, limit, search) {
        try {
            const mentors = await usersData.searchMentors(page, limit, search);

            if (mentors[0].data.length < 1) {
                return common.successResponse({
                    "statusCode": httpStatusCode.ok,
                    "message": apiResponses.MENTOR_LIST,
                    "result": {
                        "data": [],
                        "count": 0
                    }
                })
            }

            let foundKeys = {};
            let result = [];

            for (let mentor of mentors[0].data) {
                /* Assigned image url from the stored location */
                if (mentor.image) {
                    if (process.env.CLOUD_STORAGE === 'GCP') {
                        mentor.image = await fileHelper.getGcpDownloadableUrl(mentor.image);
                    } else if (process.env.CLOUD_STORAGE === 'AWS') {
                        mentor.image = await fileHelper.getAwsDownloadableUrl(mentor.image);
                    } else if (process.env.CLOUD_STORAGE === 'AZURE') {
                        mentor.image = await fileHelper.getAzureDownloadableUrl(mentor.image);
                    }
                }
                
                let firstChar = mentor.name.charAt(0);
                firstChar = firstChar.toUpperCase();

                if (!foundKeys[firstChar]) {
                    result.push({
                        key: firstChar,
                        values: [mentor]
                    });
                    foundKeys[firstChar] = result.length;
                } else {
                    let index = foundKeys[firstChar] - 1;
                    result[index].values.push(mentor);
                }
            }

            return common.successResponse({
                statusCode: httpStatusCode.ok,
                message: apiResponses.MENTOR_LIST,
                result: {
                    data: result,
                    count: mentors[0].count
                }
            });

        } catch (error) {
            throw error;
        }
    }
}