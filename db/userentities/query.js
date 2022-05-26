/**
 * name : models/entities/query
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Users entities database operations
 */

// Dependencies
const UserEntities = require("./model");

module.exports = class UserEntityData {
  static createEntity(data) {
    return new Promise(async (resolve, reject) => {
      try {
        await new UserEntities(data).save();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  static findOneEntity(filter, projection = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const userEntityData = await UserEntities.findOne(filter, projection);
        resolve(userEntityData);
      } catch (error) {
        reject(error);
      }
    });
  }

  static findAllEntities(filter, projection = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const userEntitiesData = await UserEntities.find(filter, projection);
        resolve(userEntitiesData);
      } catch (error) {
        reject(error);
      }
    });
  }

  static updateOneEntity(filter, update, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await UserEntities.updateOne(filter, update, options);
        if (
          (res.n === 1 && res.nModified === 1) ||
          (res.matchedCount === 1 && res.modifiedCount === 1)
        ) {
          resolve("ENTITY_UPDATED");
        } else if (
          (res.n === 1 && res.nModified === 0) ||
          (res.matchedCount === 1 && res.modifiedCount === 0)
        ) {
          resolve("ENTITY_ALREADY_EXISTS");
        } else {
          resolve("ENTITY_NOT_FOUND");
        }
      } catch (error) {
        reject(error);
      }
    });
  }
};
