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
				title: {
					type: 'string',
				},
				user_type: {
					type: 'integer',
				},
				status: {
					type: 'string',
				},
				visibility: {
					type: 'string',
				},
				organization_id: {
					type: 'integer',
				},
			},
			required: ['title', 'user_type', 'status', 'visibility', 'organization_id'],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
				correlation: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation'],
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
				title: {
					type: 'string',
				},
				user_type: {
					type: 'integer',
				},
				status: {
					type: 'string',
				},
				visibility: {
					type: 'string',
				},
				organization_id: {
					type: 'integer',
				},
			},
			required: ['title', 'user_type', 'status', 'visibility', 'organization_id'],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
				correlation: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation'],
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
				formsVersion: {
					type: 'array',
					items: {},
				},
				correlation: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation'],
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
								title: {
									type: 'string',
								},
								user_type: {
									type: 'integer',
								},
								visibility: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'integer',
								},
							},
							required: ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								title: {
									type: 'string',
								},
								user_type: {
									type: 'integer',
								},
								visibility: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'integer',
								},
							},
							required: ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								title: {
									type: 'string',
								},
								user_type: {
									type: 'integer',
								},
								visibility: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'integer',
								},
							},
							required: ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								title: {
									type: 'string',
								},
								user_type: {
									type: 'integer',
								},
								visibility: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'integer',
								},
							},
							required: ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								title: {
									type: 'string',
								},
								user_type: {
									type: 'integer',
								},
								visibility: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'integer',
								},
							},
							required: ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								title: {
									type: 'string',
								},
								user_type: {
									type: 'integer',
								},
								visibility: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'integer',
								},
							},
							required: ['id', 'title', 'user_type', 'visibility', 'status', 'organization_id'],
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
				formsVersion: {
					type: 'array',
					items: {},
				},
				correlation: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation'],
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
