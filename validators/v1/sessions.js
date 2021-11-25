/**
 * name : validators/v1/entity.js
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Validations of user entities controller
 */

module.exports = {

    update: (req) => {
        if (!req.params.id) {
            req.checkBody('title')
                .notEmpty()
                .withMessage('title field is empty')
                .matches(/^[A-Za-z0-9 ]+$/)
                .withMessage('title is invalid');


            req.checkBody('description')
                .notEmpty()
                .withMessage('description field is empty')
                .matches(/^[A-Za-z0-9 ]+$/)
                .withMessage('description is invalid');

            req.checkBody('startDate')
                .notEmpty()
                .withMessage('startDate field is empty');

            req.checkBody('endDateTime')
                .notEmpty()
                .withMessage('endDateTime field is empty');


            req.checkBody('recommendedFor')
                .notEmpty()
                .withMessage('recommendedFor field is empty');

            req.checkBody('categories')
                .notEmpty()
                .withMessage('categories field is empty');

            req.checkBody('medium')
                .notEmpty()
                .withMessage('medium field is empty');

        } else {
            req.checkBody('title')
                .optional()
                .withMessage('title field is empty')
                .matches(/^[A-Za-z0-9 ]+$/)
                .withMessage('title is invalid');

            req.checkBody('description')
                .optional()
                .withMessage('description field is empty')
                .matches(/^[A-Za-z0-9 ]+$/)
                .withMessage('description is invalid');
        }
    },
    details: (req) => {

        req.checkParams('id')
            .notEmpty()
            .withMessage('id param is empty');
    },

    enroll: (req) => {
        req.checkParams('id')
            .notEmpty()
            .withMessage('id param is empty')
            .isMongoId()
            .withMessage('id is invalid');
    },

    unEnroll: (req) => {
        req.checkParams('id')
            .notEmpty()
            .withMessage('id param is empty')
            .isMongoId()
            .withMessage('id is invalid');
    },

    list: (req) => {

    },

    share: (req) => {
        req.checkParams('id')
            .notEmpty()
            .withMessage('id param is empty')
            .isMongoId()
            .withMessage('id is invalid');
    }
};