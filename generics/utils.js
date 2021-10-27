/**
 * name : utils.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Utils helper function.
 */

const jwt = require('jsonwebtoken');

const generateToken = (tokenData, secretKey, expiresIn) => {
    return jwt.sign(tokenData, secretKey, { expiresIn });
};

module.exports = {
    generateToken
}