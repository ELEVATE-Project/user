/**
 * name : db/users/model
 * author : Aman Karki
 * Date : 07-Oct-2021
 * Description : User schema data
 */

// Dependencies
const mongoose = require('mongoose')
const { aes256cbc } = require('elevate-encryption')
const Schema = mongoose.Schema
// Adding the package
const mongooseLeanGetter = require('mongoose-lean-getters')

const userSchema = new Schema(
	{
		email: {
			address: {
				type: String,
				set: aes256cbc.encrypt,
				get: aes256cbc.decrypt,
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
		educationQualification: {
			type: String,
			default: null,
		},
		refreshTokens: [{ token: String, exp: Number }],
		otpInfo: {
			otp: Number,
			exp: Number,
		},
		languages: [{ value: String, label: String }],
		rating: {
			type: Object,
		},
		preferredLanguage: {
			type: String,
			default: 'en',
		},
		updatedAt: Date,
		deletedAt: Date,
	},
	{
		versionKey: false,
		toObject: { getters: true, setters: true },
		toJSON: { getters: true, setters: true },
		runSettersOnQuery: true,
	}
)
userSchema.plugin(mongooseLeanGetter)
const Users = db.model('users', userSchema)

module.exports = Users
