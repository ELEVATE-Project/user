/**
 * name : gcp.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : Google cloud services methods.
 */
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const filesHelpers = require('../../generics/files-helper');

module.exports = class CloudServices {

    /**
     * Cloud Signed url
     * @method
     * @name getSignedUrl
     * @param {Object} req - request data.
     * @param {String} req.decodedToken._id - user id.
     * @param {String} req.query.fileName - fileName.
     * @returns {JSON} - returns cloud signed url.
    */

    async getSignedUrl(req) {
        try {
            const destFilePath = `session/${req.decodedToken._id}-${new Date().getTime()}-${req.query.fileName}`;
            let response;

            if (process.env.CLOUD_STORAGE === 'GCP') {
                response = await filesHelpers.getGcpSignedUrl(destFilePath);
            } else if (process.env.CLOUD_STORAGE === 'AWS') {
                response = await filesHelpers.getAwsSignedUrl(destFilePath);
            } else if (process.env.CLOUD_STORAGE === 'AZURE') {
                response = await filesHelpers.getAzureSignedUrl(destFilePath);
            }
            response.destFilePath = destFilePath
            return common.successResponse({ message: apiResponses.SIGNED_URL_GENERATED_SUCCESSFULLY, statusCode: httpStatusCode.ok, responseCode: 'OK', result: response });
        } catch (error) {
            return error;
        }
    }
}