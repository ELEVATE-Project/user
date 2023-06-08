'use strict'
const dbPsql = require('../models/index')
const systemUsers = dbPsql.system_users;
// const Op = dbPsql.Sequelize.Op;

module.exports = class SystemUsersData {
	static async findUsersByEmail(email) {
		
		try {

			return systemUsers.findOne({ where: { 'email': email }});

		} catch (error) {
			return error
		}
	}

	static async create(data) {
		
		try {

			return systemUsers.create(data);

		} catch (error) {
			return error
		}
	}

}