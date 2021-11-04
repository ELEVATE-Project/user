/**
 * name : models/entities/query
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Users entities database operations
 */

const Entities = require("./model");

module.exports = class UserEntityData {

    static createEntity(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await (new Entities(data)).save();
                resolve(true)
            } catch (error) {
                reject(error);
            }
        });
    }

    static findOneEntity(filter, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const userEntityData = await Entities.findOne(filter, projection);
                resolve(userEntityData);
            } catch (error) {
                reject(error);
            }
        })
    }

    static findAllEntities(filter, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const userEntitiesData = await Entities.find(filter, projection);
                resolve(userEntitiesData);
            } catch (error) {
                reject(error);
            }
        })
    }

    static updateOneEntity(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Entities.updateOne(filter, update, options);
                if (res.n === 1 && res.nModified === 1) {
                    resolve('ENTITY_UPDATED')
                } else if (res.n === 1 && res.nModified === 0) {
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
