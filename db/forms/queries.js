/**
 * name : models/forms/query
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Users database operations
 */

const Forms = require("./model");

module.exports = class FormsData {

    static createForm(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await (new Forms(data)).save();
                resolve(true)
            } catch (error) {
                reject(error);
            }
        });
    }

    static findOneForm(type, subType, action, ver, templateName) {
        const filter = { type, subType, action, ver, "data.templateName": templateName };
        const projection = {};
        return new Promise(async (resolve, reject) => {
            try {
                const formData = await Forms.findOne(filter, projection);
                resolve(formData);
            } catch (error) {
                reject(error);
            }
        })
    }

    static updateOneForm(update, options = {}) {
        const filter = { type: update.type, subType: update.subType, action: update.action, ver: update.ver, 'data.templateName': update.data.templateName };
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Forms.updateOne(filter, update, options);
                if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
                    resolve('ENTITY_UPDATED')
                } else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
                    resolve('ENTITY_ALREADY_EXISTS')
                } else {
                    resolve('ENTITY_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
