/**
 * name : models/notification-template/query
 * author : Aman Gupta
 * Date : 06-Dec-2021
 * Description : Notification template database operations
 */

// Dependencies
const NotificationTemplate = require('./model');

module.exports = class NotificationTemplateData {

    static findOneEmailTemplate(code) {
        const filter = {
            code,
            type: 'email',
            deleted: false,
            status: 'active',
        };
        return new Promise(async (resolve, reject) => {
            try {
                const templateData = await NotificationTemplate.findOne(filter).lean();
                resolve(templateData);
            } catch (error) {
                reject(error);
            }
        })
    }
}