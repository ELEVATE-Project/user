const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseLeanGetter = require('mongoose-lean-getters')
const issueSchema = new Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		index: true,
	},
	description: {
		type: String,
		required: true,
	},
	isEmailTriggered: {
		type: Boolean,
		default: false,
	},
	metaData: {
		type: Object,
	},
})
issueSchema.plugin(mongooseLeanGetter)
const Issues = db.model('issues', issueSchema)

module.exports = Issues
