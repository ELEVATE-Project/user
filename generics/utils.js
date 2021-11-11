/**
 * name : utils.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Utils helper function.
 */

const fs = require('fs');


const jwt = require('jsonwebtoken');

const generateToken = (tokenData, secretKey, expiresIn) => {
    return jwt.sign(tokenData, secretKey, { expiresIn });
};

const clearFile = (filePath) => {
    fs.unlink(filePath, err => {
        if (err) console.log(err);
    })
};

module.exports = {
    generateToken,
    clearFile
}