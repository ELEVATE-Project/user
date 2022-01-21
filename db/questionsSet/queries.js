/**
 * name : models/questionsSet/query
 * author : Rakesh Kumar
 * Date : 01-Dec-2021
 * Description : Users database operations
 */

 const QuestionsSet = require("./model");

 module.exports = class QuestionsData {
 
     static createQuestionsSet(data) {
         return new Promise(async (resolve, reject) => {
             try {
                 let questionSet = await (new QuestionsSet(data)).save();
                 resolve(questionSet)
             } catch (error) {
                 reject(error);
             }
         });
     }
 
     static findOneQuestionsSet(filter, projection = {}) {
         return new Promise(async (resolve,reject) => {
             try { 
                 const questionsSetData = await QuestionsSet.findOne(filter, projection);
                 resolve(questionsSetData);
             } catch(error) {
                 reject(error);
             }
         })
     }
 
     static updateOneQuestionsSet(filter, update, options = {}) {
         return new Promise(async (resolve, reject) => {
             try {
                 const res = await QuestionsSet.updateOne(filter, update, options);
                 if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
                     resolve('QUESTIONS_SET_UPDATED')
                 } else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
                     resolve('QUESTIONS_SET_ALREADY_EXISTS')
                 } else {
                     resolve('QUESTIONS_SET_NOT_FOUND');
                 }
             } catch (error) {
                 reject(error);
             }
         });
     }
 }
 