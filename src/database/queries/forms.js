'use strict'
// const model = require('../models/index')
const db = require('../models/index')
const Forms = db.forms
// const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		// return await model.forms.create(data)
		const form = await Forms.create(data)
		console.log('form created successfully', form)
		return form
	} catch (err) {
		console.log(err)
	}
}
