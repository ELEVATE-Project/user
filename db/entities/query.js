/**
 * name : models/entities/query
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Users entities database operations
 */

const ObjectId = require('mongoose').Types.ObjectId;
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

    static findOneEntity(type, value) {
        const filter = { type, value };
        return new Promise(async (resolve, reject) => {
            try {
                const userEntityData = await Entities.findOne(filter);
                resolve(userEntityData);
            } catch (error) {
                reject(error);
            }
        });
    }

    static findAllEntities(filter) {
        const projection = { value: 1, label: 1, _id: 0 };
        return new Promise(async (resolve, reject) => {
            try {
                const userEntitiesData = await Entities.find(filter, projection);
                resolve(userEntitiesData);
            } catch (error) {
                reject(error);
            }
        })
    }

    static updateOneEntity(_id, update, options = {}) {
        update.updatedBy = ObjectId(update.updatedBy);
        const filter = {
            _id: ObjectId(_id)
        };
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Entities.updateOne(filter, update, options);
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

    static deleteOneEntity(_id) {
        const update = { deleted: true };
        const filter = {
            _id: ObjectId(_id)
        };
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Entities.updateOne(filter, update);
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
