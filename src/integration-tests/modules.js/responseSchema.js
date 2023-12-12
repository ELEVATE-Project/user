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
				Id: {
					type: 'integer',
				},
				code: {
					type: 'string',
				},
				status: {
					type: 'string',
				},
			},
			required: ['Id', 'code', 'status'],
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

const updateSchema = {
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
				id: {
					type: 'integer',
				},
				status: {
					type: 'string',
				},
				code: {
					type: 'string',
				},
			},
			required: ['id', 'status', 'code'],
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
	$schema: 'http://json-schema.org/draft-04/schema#',
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

const listSchema = {
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
				data: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								code: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
							},
							required: ['id', 'code', 'status'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								code: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
							},
							required: ['id', 'code', 'status'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								code: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
							},
							required: ['id', 'code', 'status'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								code: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
							},
							required: ['id', 'code', 'status'],
						},
					],
				},
				count: {
					type: 'integer',
				},
			},
			required: ['data', 'count'],
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
	updateSchema,
	deleteSchema,
	listSchema,
}
