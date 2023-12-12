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
				status: {
					type: 'string',
				},
				module: {
					type: 'string',
				},
				actions: {
					type: 'string',
				},
			},
			required: ['Id', 'status', 'module', 'actions'],
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
				results: {
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
										module: {
											type: 'string',
										},
										actions: {
											type: 'string',
										},
										status: {
											type: 'string',
										},
									},
									required: ['id', 'code', 'module', 'actions', 'status'],
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
										module: {
											type: 'string',
										},
										actions: {
											type: 'string',
										},
										status: {
											type: 'string',
										},
									},
									required: ['id', 'code', 'module', 'actions', 'status'],
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
										module: {
											type: 'string',
										},
										actions: {
											type: 'string',
										},
										status: {
											type: 'string',
										},
									},
									required: ['id', 'code', 'module', 'actions', 'status'],
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
										module: {
											type: 'string',
										},
										actions: {
											type: 'string',
										},
										status: {
											type: 'string',
										},
									},
									required: ['id', 'code', 'module', 'actions', 'status'],
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
										module: {
											type: 'string',
										},
										actions: {
											type: 'string',
										},
										status: {
											type: 'string',
										},
									},
									required: ['id', 'code', 'module', 'actions', 'status'],
								},
							],
						},
						count: {
							type: 'integer',
						},
					},
					required: ['data', 'count'],
				},
			},
			required: ['results'],
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
