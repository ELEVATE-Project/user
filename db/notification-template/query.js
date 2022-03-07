/**
 * name : models/notification-template/query
 * author : Aman Gupta
 * Date : 06-Dec-2021
 * Description : Notification template database operations
 */

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

                if (templateData && templateData.emailHeader) {
                    const header = await this.getEmailHeader(templateData.emailHeader);
                    if(header && header.body){
                        templateData['body'] = header.body + templateData['body'];
                    }
                }

                if (templateData && templateData.emailFooter) {
                    const footer = await this.getEmailFooter(templateData.emailFooter);
                    if(footer && footer.body){
                        templateData['body'] = templateData['body'] + footer.body;
                    }
                }
                
                resolve(templateData);

            } catch (error) {
                reject(error);
            }
        })
    }

    static getEmailHeader(header) {
        return new Promise(async (resolve, reject) => {
            try {
                const filterEmailHeader = {
                    code: header,
                    type: 'emailHeader',
                    deleted: false,
                    status: 'active',
                };
                const headerData = await NotificationTemplate.findOne(filterEmailHeader).lean();

                resolve(headerData);

            } catch (error) {
                reject(error);
            }
        });
    }
    static getEmailFooter(footer) {
        return new Promise(async (resolve, reject) => {
            try {
              
                const filterEmailFooter = {
                    code: footer,
                    type: 'emailFooter',
                    deleted: false,
                    status: 'active',
                };
                const footerData = await NotificationTemplate.findOne(filterEmailFooter).lean();

                resolve(footerData);

            } catch (error) {
                reject(error);
            }
        });
    }

}