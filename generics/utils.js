/**
 * name : utils.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Utils helper function.
 */

const bcryptJs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (tokenData, secretKey, expiresIn) => {
    return jwt.sign(tokenData, secretKey, { expiresIn });
};

const hashPassword = (password) => {
    const salt = bcryptJs.genSaltSync(10);
    let hashPassword = bcryptJs.hashSync(password, salt);
    return hashPassword;
}

const comparePassword = (password1,password2) => {
    return bcryptJs.compareSync(password1, password2);
}

module.exports = {
    generateToken,
    hashPassword,
    comparePassword
}