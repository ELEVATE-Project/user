/**
 * name : models/users/query
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Users database operations
 */

const Users = require("./model");

module.exports = class UsersData {
    
    static findOne(filter, projection = {}) {
        return new Promise(async (resolve,reject) => {
            try { 
                const userData = await Users.findOne(filter, projection);
                resolve(userData);
            } catch(error) {
                reject(error);
            }
        })
    }

    static createUser(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await (new Users(data)).save();
                resolve(true)
            } catch (error) {
                reject(error);
            }
        });
    }

    static updateOneUser(filter, update, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await Users.updateOne(filter, update, options);
                if (res.ok === 1 && res.nModified === 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    static searchMentors(page,limit,search) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let users = await Users.aggregate([
                    {
                        $match: { 
                            deleted: false,
                            isAMentor: true,
                            $or: [
                                { name: new RegExp(search, 'i') }
                            ] 
                        },
                    },
                    {
                        $sort: {"name": 1}
                    },
                    {
                        $project: {
                            name: 1,
                            image: 1,
                            designation: 1,
                            areasOfExpertise: 1
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

                return resolve(users);
            } catch (error) {
                return reject(error);
            }
        })
    }
}
