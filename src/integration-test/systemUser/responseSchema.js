const createSystemUserSchema = {
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
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const loginSchema = {
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
				access_token: {
					type: 'string',
				},
				refresh_token: {
					type: 'string',
				},
				user: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
						},
						email: {
							type: 'object',
							properties: {
								address: {
									type: 'string',
								},
								verified: {
									type: 'boolean',
								},
							},
							required: ['address', 'verified'],
						},
						name: {
							type: 'string',
						},
						role: {
							type: 'string',
						},
						updatedAt: {
							type: 'string',
						},
						createdAt: {
							type: 'string',
						},
						__v: {
							type: 'integer',
						},
					},
					required: ['_id', 'email', 'name', 'role', 'updatedAt', 'createdAt', '__v'],
				},
			},
			required: ['access_token', 'refresh_token', 'user'],
		},
		meta: {
			type: 'object',
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

module.exports = {
	createSystemUserSchema,
	loginSchema,
}
