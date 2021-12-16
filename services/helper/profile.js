/**
 * name : services/helper/profile.js
 * author : Aman
 * created-date : 02-Nov-2021
 * Description : User Profile Service Helper.
 */

const ObjectId = require('mongoose').Types.ObjectId;

const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const usersData = require("../../db/users/queries");

module.exports = class ProfileHelper {

    static async update(bodyData, _id) {
        bodyData.updatedAt = new Date().getTime();
        try {
            await usersData.updateOneUser({ _id: ObjectId(_id) }, bodyData);
            return common.successResponse({ statusCode: httpStatusCode.accepted, message: apiResponses.PROFILE_UPDATED_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }

    static async details(_id) {
        const projection = { password: 0, "designation.deleted": 0, "designation._id": 0, "areasOfExpertise.deleted": 0, "areasOfExpertise._id": 0, "location.deleted": 0, "location._id": 0, refreshTokens: 0 }
        try {
            const user = await usersData.findOne({ _id: ObjectId(_id) }, projection);
            if (user && user.image) {
                user.image = utilsHelper.getDownloadableUrl(user.image);
            }
            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.PROFILE_FETCHED_SUCCESSFULLY, result: user ? user : {} });
        } catch (error) {
            throw error;
        }
    }
}