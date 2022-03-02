/**
 * name : email-notifications
 * author : Rakesh Kumar
 * Date : 03-Nov-2021
 * Description : Contains email notifications related data
 */

//Dependencies
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



/**
  * Send Email
  * @method
  * @name sendEmail
  * @param  {Object} params - contains email information for sending email
  * @param  {String} params.from - email id of the sender 
  * @param  {String} params.to - email id of the receiver 
  * @param  {String} params.subject - subject of the email
  * @param  {String} params.body - contains email content 
  * @param  {String} params.cc - contains the cc of the email
  * @returns {JSON} Returns response of the email sending information
*/  
async function sendEmail(params) {
    try {
        let fromMail = process.env.SENDGRID_FROM_MAIL;
        if (params.from) {
            fromMail = params.from;
        }

        let message = {
            from: fromMail, // sender address
            to: params.to, // list of receivers
            subject: params.subject, // Subject line
            text: params.body // plain text body
        };
        if (params.cc) {
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
        return {
            status: "success",
            message: "successfully mail sent",
        };

    } catch (error) {
        return {
            status: "failed",
            message: 'Mail server is down, please try after some time',
            errorObject: error
        };
    }
}

module.exports = {
    sendEmail: sendEmail
}