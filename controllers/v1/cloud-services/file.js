/**
 * name : gcp.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : Google cloud services methods.
 */
const path = require('path');

const httpStatusCode = require("../../../generics/http-status");
const apiResponses = require("../../../constants/api-responses");
const common = require('../../../constants/common');
const filesHelpers = require('../../../generics/files-helper');
const utils = require('../../../generics/utils');

module.exports = class Gcp {

    /**
     * @api {post} /user/api/v1/cloud-services/gcp/uploadFile - Upload file
     * @apiVersion 1.0.0
     * @apiGroup Gcp
     * @apiHeader {String} X-auth-token
     * @apiParamExample {fromData} Request:
     * {}
     * @apiSampleRequest /user/api/v1/cloud-services/gcp/uploadFile
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     *   "responseCode": "OK",
     *   "message": "File uploaded successfully",
     *   "result": {
     *       "imageUrl": "https://storage.googleapis.com/mentoring-images/1636469203975logo.png"
     *   }
     * }
     */

    /**
      * Upload file
      * @method
      * @name upload
      * @param  {Request} - req  request body.
      * @param  {files} - req.files.file - actual file to upload
      * @returns {JSON} - Response with status message and result.
    */
    async upload(req) {
        try {
            if (req.files && req.files.file) {
                const filePath = path.join(__dirname, '../../../', req.files.file.tempFilePath);
                const destFileName = new Date().getTime() + req.files.file.name;
                let response;
                let imageUrl;
                if (process.env.CLOUD_STORAGE === 'GCP') {
                    response = await filesHelpers.uploadFileInGcp(filePath, destFileName);
                    imageUrl = `https://storage.googleapis.com/${response.bucket}/${response.name}`;
                } else if (process.env.CLOUD_STORAGE === 'AWS') {
                    response = await filesHelpers.uploadFileInAws(filePath, destFileName);
                    imageUrl = response.Location;
                } else if (process.env.CLOUD_STORAGE === 'AZURE') {
                    response = await filesHelpers.uploadFileInAzure(filePath, destFileName);
                    imageUrl = `https://${response.accountName}.blob.core.windows.net/${response.containerName}/${destFileName}`;
                }
                utils.clearFile(filePath);
                return common.successResponse({ message: apiResponses.FILE_UPLOADED_SUCCESSFULLY, statusCode: httpStatusCode.ok, responseCode: 'OK', result: { fileName: destFileName, fileLocation: imageUrl } });
            } else {
                return common.failureResponse({ message: apiResponses.FILE_NOT_PROVIDED, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
        } catch (error) {
            return error;
        }
    }

}