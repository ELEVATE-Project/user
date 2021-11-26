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
const fileHelper = require('../../generics/files-helper');

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
        const projection = { password: 0, "designation.deleted": 0, "designation._id": 0, "areasOfExpertise.deleted": 0, "areasOfExpertise._id": 0, "location.deleted": 0, "location._id": 0, refreshTokens: 0}
        try {
            const user = await usersData.findOne({ _id: ObjectId(_id) }, projection);
            if (user && user.image) {
                if (process.env.CLOUD_STORAGE === 'GCP') {
                    user.image = await fileHelper.getGcpDownloadableUrl(user.image);
                } else if (process.env.CLOUD_STORAGE === 'AWS') {
                    user.image = await fileHelper.getAwsDownloadableUrl(user.image);
                } else if (process.env.CLOUD_STORAGE === 'AZURE') {
                    user.image = await fileHelper.getAzureDownloadableUrl(user.image);
                }
                // if (process.env.CLOUD_STORAGE === 'GCP') {
                //     user.image = `https://storage.googleapis.com/${process.env.DEFAULT_GCP_BUCKET_NAME}/${user.image}`;
                // } else if (process.env.CLOUD_STORAGE === 'AWS') {
                //     user.image = `https://${process.env.DEFAULT_AWS_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${user.image}`;
                // } else if (process.env.CLOUD_STORAGE === 'AZURE') {
                //     user.image = `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.DEFAULT_AZURE_CONTAINER_NAME}/${user.image}`;
                // }
            }
            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.PROFILE_FETCHED_SUCCESSFULLY, result: user ? user : {}});
        } catch (error) {
            throw error;
        }
    }
}