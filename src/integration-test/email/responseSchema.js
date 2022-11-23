const sendEmailFailedSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		error: {
			type: 'array',
			items: {},
		},
	},
	required: ['responseCode', 'message', 'error'],
}
module.exports = {
	sendEmailFailedSchema,
}
