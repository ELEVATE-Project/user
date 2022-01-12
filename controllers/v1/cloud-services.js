/**
 * name : cloud-services.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : Cloud services controllers.
 */
const filesHelpers = require('../../services/helper/files');

module.exports = class CloudServices {

    /**
      * Get Signed Url
      * @method
      * @name getSignedUrl
      * @param {JSON} req  request body.
      * @returns {JSON} Response with status message and result.
    */
     async getSignedUrl(req) {
        try {
            const signedUrlResponse = await filesHelpers.getSignedUrl(req.query.fileName, req.decodedToken._id);
            return signedUrlResponse;
        } catch (error) {
            return error;
        }
    }
}