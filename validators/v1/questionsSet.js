/**
 * name : validators/v1/questions.js
 * author : Rakesh Kumar
 * Date : 01-Dec-2021
 * Description : Validations of user questions controller
 */

 module.exports = {
    read: (req) => {

        req.checkParams('id')
            .notEmpty()
            .withMessage('id param is empty');
    },
    update: (req) => {

        req.checkParams('id')
            .notEmpty()
            .withMessage('id param is empty');
    },
    create: (req) => {

        req.checkBody('questions')
        .notEmpty()
        .withMessage('questions field is empty');

        req.checkBody('code')
        .notEmpty()
        .withMessage('code field is empty');
    }
};

