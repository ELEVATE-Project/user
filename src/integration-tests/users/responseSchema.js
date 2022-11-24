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
								key: {
									type: 'string',
								},
								values: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												_id: {
													type: 'string',
												},
												name: {
													type: 'string',
												},
												areasOfExpertise: {
													type: 'array',
													items: {},
												},
											},
											required: ['_id', 'name', 'areasOfExpertise'],
										},
									],
								},
							},
							required: ['key', 'values'],
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
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const pendingFeedBacksSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'array',
			items: {},
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

module.exports = {
	listSchema,
	pendingFeedBacksSchema,
}
