/**
 * name : models/sessionAttendees/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Session Attendes database operations
 */

const SessionAttendees = require("./model");

module.exports = class SessionsAttendees {
    static create(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await (new SessionAttendees(data)).save();
                resolve(true)
            } catch (error) {
                reject(error);
            }
        });
    }

    static findLinkBySessionAndUserId(id,sessionId) {
        return new Promise(async (resolve,reject) => {
            try { 
                const session = await SessionAttendees.findOne({userId:id,sessionId:sessionId,status: "enrolled",deleted:false}).lean();
                resolve(session);
            } catch(error) {
                reject(error);
            }
        });
    }
    
    static findOneSessionAttendee(sessionId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const session = await SessionAttendees.findOne({ sessionId, userId, deleted: false }).lean();
                resolve(session);
            } catch (error) {
                reject(error);
            }
        })
    }

    static updateOne(filter, update) {
        return new Promise(async (resolve, reject) => {
            try {
                const updateResponse = await SessionAttendees.updateOne(filter, update);
                if (updateResponse.n === 1 && updateResponse.nModified === 1) {
                    resolve('SESSION_ATTENDENCE_UPDATED')
                } else if (updateResponse.n === 1 && updateResponse.nModified === 0) {
                    resolve('SESSION_ATTENDENCE_ALREADY_UPDATED')
                } else {
                    resolve('SESSION_ATTENDENCE_NOT_FOUND');
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    
    static unEnrollFromSession(sessionId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await SessionAttendees.deleteOne({ sessionId, userId }).lean();
                if (result.n === 1 && result.deletedCount === 1) {
                    resolve('USER_UNENROLLED');
                } else if (result.n === 0) {
                    resolve('USER_NOT_ENROLLED')
                }
            } catch (error) {
                reject(error);
            }
        })
    }

    static findAllUpcomingMenteesSession(page, limit, search, filters) {
        return new Promise(async (resolve, reject) => {
            try {

                const sessionAttendeesData = await SessionAttendees.aggregate([
                    {
                        $lookup: {
                            from: 'sessions',
                            localField: 'sessionId',
                            foreignField: '_id',
                            as: 'sessionDetail'
                        }
                    },
                    {
                        $match: {
                            $and: [
                                filters,
                                { deleted: false }
                            ],
                            $or: [
                                { 'sessionDetail.title': new RegExp(search, 'i') },
                                { 'sessionDetail.mentorName': new RegExp(search, 'i') }
                            ]
                        },
                    },
                    {
                        $sort: { 'sessionDetail.startDateTime': 1 }
                    },
                    {
                        $project: {
                            sessionId: 1,
                            _id: 1,
                            'sessionDetail._id': 1,
                            'sessionDetail.mentorName': 1,
                            'sessionDetail.status': 1,
                            'sessionDetail.title': 1,
                            'sessionDetail.description': 1,
                            'sessionDetail.startDateTime': 1,
                            'sessionDetail.endDateTime': 1,
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
                resolve(sessionAttendeesData);
            } catch (error) {
                reject(error);
            }
        })
    }

    static findPendingFeedbackSessions(filters){
        return new Promise(async (resolve, reject) => {
            try {

                const sessionAttendeesData = await SessionAttendees.aggregate([
                    {
                        $lookup: {
                            from: 'sessions',
                            localField: 'sessionId',
                            foreignField: '_id',
                            as: 'sessionDetail'
                        }
                    },
                    {
                        $match: {
                            $and: [
                                filters,
                                { deleted: false }
                            ]
                        },
                    },
                    {
                        $project: {
                            sessionId: 1,
                            'sessionDetail._id': 1,
                            'sessionDetail.title': 1,
                            'sessionDetail.description': 1,
                        }
                    },
                    { $unwind : "$sessionDetail" }
                   
                ]);
                resolve(sessionAttendeesData);

            } catch (error) {
                reject(error);
            }
        })
    }
}
