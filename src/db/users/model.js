/**
 * name : db/users/model
 * author : Aman Karki
 * Date : 07-Oct-2021
 * Description : User schema data
 */

// Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
	email: {
		address: {
			type: String,
			index: {
				unique: true,
			},
			required: true,
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	password: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	gender: String,
	designation: [{ value: String, label: String }],
	location: [{ value: String, label: String }],
	about: String,
	shareLink: String,
	areasOfExpertise: [{ value: String, label: String }],
	image: String,
	experience: String,
	lastLoggedInAt: Date,
	isAMentor: {
		type: Boolean,
		default: false,
		index: true,
	},
	hasAcceptedTAndC: {
		type: Boolean,
		default: false,
	},
	deleted: {
		type: Boolean,
		default: false,
		required: true,
	},
	refreshTokens: [{ token: String, exp: Number }],
	otpInfo: {
		otp: Number,
		exp: Number,
	},
	languages: [{ value: String, label: String }],
})

const Users = db.model('users', userSchema)

module.exports = Users
