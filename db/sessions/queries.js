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
                if (updateResponse.n === 1 && updateResponse.nModified === 1) {
                    resolve('SESSION_UPDATED')
                } else if (updateResponse.n === 1 && updateResponse.nModified === 0) {
                    resolve('SESSION_ALREADY_EXISTS')
                } else {
                    resolve('SESSION_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        });
    }


    static searchAndPagination(page, limit, search) {
        return new Promise(async (resolve, reject) => {
            try {

                let sessions = await Sessions.aggregate([
                    {
                        $match: { status: 'published' },
                        isDeleted: false,
                        startDateTime: {
                            $gte: new Date()
                        },
                        $or: [
                            { mentorName: new RegExp(search, 'i') },
                            { title: new RegExp(search, 'i') }
                        ]
                    },
                    {
                        $project: {
                            title: 1,
                            mentorName: 1,
                            description: 1,
                            startDateTime: 1,
                            endDateTime: 1,
                            status: 1
                        }
                    },
                    {
                        $sort: {
                            startDateTime: 1
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
                    },
                    {
                        $project: {
                            "data": 1,
                            "count": {
                                $arrayElemAt: ["$totalCount.count", 0]
                            }
                        }
                    }
                ]);

                return resolve(sessions);
            } catch (error) {
                return reject(error);
            }
        })
    }
    static findOneSession(filter, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const sessionData = await Sessions.findOne(filter, projection);
                resolve(sessionData);
            } catch (error) {

                return reject(error);
            }
        })
    }

    static findSessionById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const session = await Sessions.findOne({ '_id': id, deleted: false, status: "published" }).lean();
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
                                { description: new RegExp(search, 'i') }
                            ]
                        },
                    },
                    {
                        $sort: { "title": 1 }
                    },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            startDateTime: 1,
                            endDateTime: 1,
                            categories: 1,
                            medium: 1,
                            status: 1,
                            startDateTime: 1,
                            endDateTime: 1
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


}


