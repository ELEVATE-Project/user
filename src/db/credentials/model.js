/**
 * name : db/credentials
 * author : Ankit Shahu
 * Date : 25 feb 2023
 * Description : Credentials schema
 */

// Dependencies
const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const { aes256cbc } = require('elevate-encryption')
const Schema = mongoose.Schema

const mongooseLeanGetter = require('mongoose-lean-getters')

const credentialSchema = new Schema({
	type: {
		type: String,
	},
	userId: {
		type: ObjectId,
		required: true,
	},
	data: {
		type: Object,
		required: true,
	},
})
credentialSchema.plugin(mongooseLeanGetter)

const credentials = db.model('credentials', credentialSchema)

module.exports = credentials
