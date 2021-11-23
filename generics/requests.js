const request = require('request');
const parser = require('xml2json');

var get = function(url,token = "") {
    return new Promise(async (resolve, reject) => {
        try {

            function callback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = data.body;
                    if (data.headers["content-type"].split(";")[0] !== "application/json") {
                        response = parser.toJson(data.body);
                    }

                    response = JSON.parse(response);
                    result.data = response;
                }

                return resolve(result);
            }

            let headers = {
                "content-type": "application/json"
            }

            if (token) {
                headers["x-auth-token"] = token;
            }

            const options = {
                headers : headers
            };

            request.get(url,options,callback);

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    get: get
}