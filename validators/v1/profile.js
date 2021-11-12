/**
 * name : validators/v1/profile.js
 * author : Aman Gupta
 * Date : 01-Nov-2021
 * Description : Validations of profiles controller
*/

module.exports = {
    update: (req) => {
        req.checkBody('gender')
            .trim()
            .optional()
            .isIn(['MALE', 'FEMALE', 'OTHER'])
            .withMessage('gender is invalid, must be either MALE, FEMALE or OTHER');

        req.checkBody('name')
            .trim()
            .notEmpty()
            .withMessage('name field is empty')
            .matches(/^[A-Za-z ]+$/)
            .withMessage('name is invalid');

        req.checkBody('designation')
            .notEmpty()
            .withMessage('designation field is empty')
            .isArray()
            .withMessage('designation is invalid')

        req.checkBody('location')
            .notEmpty()
            .withMessage('location field is empty')
            .isArray()
            .withMessage('location is invalid')

        req.checkBody('about')
            .notEmpty()
            .withMessage('about field is empty')

        req.checkBody('areasOfExpertise')
            .notEmpty()
            .withMessage('areasOfExpertise field is empty')
            .isArray()
            .withMessage('areasOfExpertise is invalid')

        req.checkBody('experience')
            .notEmpty()
            .withMessage('experience field is empty')
            .isFloat()
            .withMessage('experience is invalid')

        req.checkBody('hasAcceptedTAndC')
            .optional()
            .isBoolean()
            .withMessage('hasAcceptedTAndC field is invalid')

        req.checkBody('image')
            .optional()
            .isString()
            .withMessage('image field must be string only')
    },

    details: (req) => {

    }
};