const createSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'object',
			properties: {
				role_Id: {
					type: 'integer',
				},
				permission_Id: {
					type: 'integer',
				},
				module: {
					type: 'string',
				},
				actions: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
					],
				},
			},
			required: ['role_Id', 'permission_Id', 'module', 'actions'],
		},
		meta: {
			type: 'object',
			properties: {
				correlation: {
					type: 'string',
				},
				meetingPlatform: {
					type: 'string',
				},
			},
			required: ['correlation', 'meetingPlatform'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

const deleteSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'object',
		},
		meta: {
			type: 'object',
			properties: {
				correlation: {
					type: 'string',
				},
				meetingPlatform: {
					type: 'string',
				},
			},
			required: ['correlation', 'meetingPlatform'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

module.exports = {
	createSchema,
	deleteSchema,
}
