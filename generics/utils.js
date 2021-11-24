/**
 * name : utils.js
 * author : Aman
 * created-date : 04-Nov-2021
 * Description : Utils helper function.
 */

const bcryptJs = require('bcryptjs');

const hash = (str) => {
    const salt = bcryptJs.genSaltSync(10);
    let hashstr = bcryptJs.hashSync(str, salt);
    return hashstr;
}

 module.exports = {
    hash: hash
 }