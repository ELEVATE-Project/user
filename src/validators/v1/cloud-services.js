/**
 * name : validators/v1/cloud-services.js
 * author : Aman Gupta
 * Date : 16-Nov-2021
 * Description : Validations of cloud-services controller
*/

module.exports = {
    getSignedUrl: (req) => {
        req.checkQuery('fileName')
            .trim()
            .notEmpty()
            .withMessage('fileName field is empty');
    }
};