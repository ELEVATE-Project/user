/**
 * name : utils.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Utils helper function.
 */

const bcrypt = require('bcrypt');

function validEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

function validPassword(password) {
    var re = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    re.test(password);
}

function hashPassword(password) {
    return bcrypt.hashSync(password, process.env.SALT_ROUNDS);
}

module.exports = {
    validEmail: validEmail,
    validPassword: validPassword,
    hashPassword: hashPassword
}