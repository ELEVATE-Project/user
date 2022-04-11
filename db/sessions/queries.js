/**
 * name : models/sessions/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Sessions database operations
 */

const Sessions = require("./model");

module.exports = class SessionsData {

    static createSession(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await (new Sessions(data)).save();
                resolve(response)
            } catch (error) {
                reject(error);
            }
        });
    }

    static updateOneSession(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const updateResponse = await Sessions.updateOne(filter, update, options);
                if ((updateResponse.n === 1 && updateResponse.nModified === 1) || (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)) {
                    resolve('SESSION_UPDATED')
                } else if ((updateResponse.n === 1 && updateResponse.nModified === 0) || (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)) {
                    resolve('SESSION_ALREADY_UPDATED')
                } else {
                    resolve('SESSION_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    static findOneSession(filter, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const sessionData = await Sessions.findOne(filter, projection).lean();
                resolve(sessionData);
            } catch (error) {
                reject(error);
            }
        })
    }

    static findSessionById(id) {
        return new Promise(async (resolve,reject) => {
            try { 
                const session = await Sessions.findOne({'_id': id,deleted: false,status: {$ne: "cancelled"}}).lean();
                resolve(session);
            } catch (error) {
                reject(error);
            }
        })
    }

    static findAllSessions(page, limit, search, filters) {
        return new Promise(async (resolve, reject) => {
            try {

                let sessionData = await Sessions.aggregate([
                    {
                        $match: {
                            $and: [
                                filters,
                                { deleted: false }
                            ],
                            $or: [
                                { title: new RegExp(search, 'i') },
                                { mentorName: new RegExp(search, 'i') }
                            ]
                        },
                    },
                    {
                        $sort: { _id: -1 }
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            mentorName: 1,
                            description: 1,
                            startDate: 1,
                            endDate: 1,
                            status: 1,
                            image: 1,
                            endDateUtc: 1
                        }
                    },
                    {
                        $facet: {
                            "totalCount": [
                                { "$count": "count" }
                            ],
                            "data": [
                                { $skip: limit * (page - 1) },
                                { $limit: limit }
                            ],
                        }
                    }, {
                        $project: {
                            "data": 1,
                            "count": {
                                $arrayElemAt: ["$totalCount.count", 0]
                            }
                        }
                    }
                ]);
                resolve(sessionData);
                
            } catch (error) {
                reject(error);
            }
        })
    } 

    static findSessions(filter, projection = {}){
        return new Promise(async (resolve, reject) => {
            try {

                let sessionData = await Sessions.find(filter,projection).lean();
                resolve(sessionData);

            } catch (error) {
                reject(error);
            }
        })
    }
    static countSessions(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const count = await Sessions.countDocuments(filter);
                resolve(count);
            } catch (error) {
                reject(error);
            }
        });
    }

    static updateSession(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const updateResponse = await Sessions.update(filter, update, options);
                if ((updateResponse.n === 1 && updateResponse.nModified === 1) || (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)) {
                    resolve('SESSION_UPDATED')
                } else if ((updateResponse.n === 1 && updateResponse.nModified === 0) || (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)) {
                    resolve('SESSION_ALREADY_UPDATED')
                } else {
                    resolve('SESSION_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}


