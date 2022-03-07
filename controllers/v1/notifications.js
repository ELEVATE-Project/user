/**
 * name : notifications.js
 * author : Rakesh Kumar
 * created-date : 09-Dec-2021
 * Description : notifications related functions.
 */

// Dependencies
const notificationsHelper = require("../../services/helper/notifications");
const httpStatusCode = require("../../generics/http-status");

module.exports = class Notifications {

    /**
     * Notification email cron job.
     * @method
     * @name emailCronJob
     * @returns {JSON} - Send email notification.
    */
    
    async emailCronJob() {
        try {
             notificationsHelper.sendNotificationBefore15mins();
             notificationsHelper.sendNotificationBefore24Hour();
             notificationsHelper.sendNotificationBefore1Hour();
             return({
                statusCode: httpStatusCode.ok,
            });
        } catch (error) {
            return error;
        }
    }
}