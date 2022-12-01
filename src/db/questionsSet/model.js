/**
 * name : db/questions/model
 * author : Rakesh Kumar
 * Date : 30-Nov-2021
 * Description : Questions schema
 */

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const mongooseLeanGetter = require('mongoose-lean-getters')
const questionsSetSchema = new Schema({
	questions: {
		type: Array,
		required: true,
	},
	code: {
		type: String,
		required: true,
		unique: true,
	},
	deleted: {
		type: Boolean,
		default: false,
	},
	status: {
		type: String,
		default: 'published',
	},
})
questionsSetSchema.plugin(mongooseLeanGetter)
const QuestionsSet = db.model('questionSet', questionsSetSchema, 'questionSet')

module.exports = QuestionsSet
