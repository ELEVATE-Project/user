/**
 * name : models/questions/query
 * author : Rakesh Kumar
 * Date : 30-Nov-2021
 * Description : Users database operations
 */

const Questions = require("./model");

module.exports = class QuestionsData {

    static createQuestion(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let question = await (new Questions(data)).save();
                resolve(question)
            } catch (error) {
                reject(error);
            }
        });
    }

    static findOneQuestion(filter, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const questionData = await Questions.findOne(filter, projection);
                resolve(questionData);
            } catch (error) {
                reject(error);
            }
        })
    }

    static find(filter, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const questionData = await Questions.find(filter, projection).lean();
                resolve(questionData);
            } catch (error) {
                reject(error);
            }
        })
    }

    static updateOneQuestion(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Questions.updateOne(filter, update, options);
                if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
                    resolve('QUESTION_UPDATED')
                } else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
                    resolve('QUESTION_ALREADY_EXISTS')
                } else {
                    resolve('QUESTION_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    static update(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Questions.update(filter, update, options);
                if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
                    resolve('QUESTION_UPDATED')
                } else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
                    resolve('QUESTION_ALREADY_EXISTS')
                } else {
                    resolve('QUESTION_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        })
    }
    static updateData(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Questions.updateMany(filter, update, options);
                if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
                    resolve('QUESTION_UPDATED')
                } else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
                    resolve('QUESTION_ALREADY_EXISTS')
                } else {
                    resolve('QUESTION_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        })
    }
}
