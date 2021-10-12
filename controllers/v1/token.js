/**
 * name : token.js
 * author : Aman
 * created-date : 11-Oct-2021
 * Description : User token information.
 */

// Dependencies
const tokenHelper = require("../../services/helper/token");

module.exports = class Token {
    
    generateToken(req) {
        return new Promise(async (resolve,reject) => {
            try {
                const tokenGenerated = await tokenHelper.generateToken(req.body);
                return resolve(tokenGenerated);
            } catch(error) {
                return reject(error);
            }
        })
    }
}