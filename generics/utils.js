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

const elapsedMinutes = (date1,date2) => {
    var difference = (date1 - date2);
    let result = (difference / 60000);
    return result;
}

 module.exports = {
    hash: hash,
    elapsedMinutes: elapsedMinutes
 }