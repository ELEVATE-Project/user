/**
 * name : db/oragnisations/model
 * author : Rakesh Kumar
 * Date : 07-Oct-2021
 * Description : User schema data
 */

// Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Adding the package
const mongooseLeanGetter = require('mongoose-lean-getters')

const organisationSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		code: {
			type: String,
			required: true,
			index: {
				unique: true,
			},
		},
		description: String,
		deleted: {
			type: Boolean,
			default: false,
			required: true,
		},
	},
	{
		versionKey: false,
		toObject: { getters: true, setters: true },
		toJSON: { getters: true, setters: true },
		runSettersOnQuery: true,
	}
)
organisationSchema.plugin(mongooseLeanGetter)
const Organisation = db.model('organisations', organisationSchema)

module.exports = Organisation
