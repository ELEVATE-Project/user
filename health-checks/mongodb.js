/**
 * name : mongodb.js.
 * author : Aman Karki.
 * created-date : 17--2021.
 * Description : Mongodb health check.
*/

// Dependencies
const mongoose = require("mongoose");

function health_check() {
    return new Promise( async (resolve,reject) => {

        const db = mongoose.createConnection(process.env.MONGODB_URL);  
        db.on("error", function () {
            return resolve(false)
        });
        
        db.once("open", function() {
            db.close(function(){});
            return resolve(true);    
        });
    })
}

module.exports = {
    health_check : health_check
}