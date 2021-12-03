/**
 * name : validators/v1/mentees.js
 * author : Aman Gupta
 * Date : 29-Nov-2021
 * Description : Validations of mentors controller
 */

 module.exports = {

    reports: (req) => {
        req.checkQuery('filterType')
            .notEmpty()
            .withMessage('filterType query is empty')
            .isIn(['MONTHLY', 'WEEKLY', 'QUARTERLY'])
            .withMessage('filterType is invalid')
    }
};