/**
 * email-notifications.js
 *
 *  email notification functionalities are written below
 */

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * 
 * @param {Object} params api is used send the email
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