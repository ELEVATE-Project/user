const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
})

const Issues = db.model('issues', issueSchema)

module.exports = Issues
