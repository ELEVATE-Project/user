/**
 * name : db/forms/model
 * author : Aman Gupta
 * Date : 03-Nov-2021
 * Description : Forms schema
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const formSchema = new Schema({
	type: {
		type: String,
		index: { unique: true },
		required: true,
	},
	subType: {
		type: String,
		required: true,
	},
	action: {
		type: String,
		required: true,
	},
	data: {
		templateName: {
			type: String,
			required: true,
		},
		fields: {
			type: Object,
			required: true,
		},
	},
})

formSchema.pre('updateOne', function () {
	const update = this.getUpdate()

	if (update.__v != null) {
		delete update.__v
	}
	const keys = ['$set', '$setOnInsert']
	for (const key of keys) {
		if (update[key] != null && update[key].__v != null) {
			delete update[key].__v
			if (Object.keys(update[key]).length === 0) {
				delete update[key]
			}
		}
	}
	update.$inc = update.$inc || {}
	update.$inc.__v = 1
})
const Forms = db.model('forms', formSchema)

module.exports = Forms
