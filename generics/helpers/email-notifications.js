/**
 * email-notifications.js
 *
 *  email notification functionalities are written below
 */

'use strict';
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


var _this = this;
var api = {};
api.sendEmail = sendEmail;
module.exports = api;

/**
 * 
 * @param {*} sendEmail api is used send the email
 */
async function sendEmail(params) {
    return new Promise(async (resolve, reject) => {
        try {

          
            let fromMail = "rakesh.k@pacewisdom.com";
            if (params.from) {
                fromMail = params.from;
            }

            let message = {
                from: params.from_email_id, // sender address
                to: params.to, // list of receivers
                subject: params.subject, // Subject line
                text: params.body // plain text body
                // html: '<b>Hello world?</b>' // html body
            };
            if(params.cc){
                message['cc'] = params.cc;
            }
            try {
                await sgMail.send(message);
              } catch (error) {
                console.error(error);
            
                if (error.response) {
                  console.error(error.response.body)
                }
              }

            return resolve({
                status: "success",
                message: "successfully mail sent",
            })

        } catch (error) {
            return reject({
                status: "failed",
                message: error,
                errorObject: error
            });
        } finally {}
    });
}