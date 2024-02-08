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
				questions: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
					],
				},
				code: {
					type: 'string',
				},
				deleted: {
					type: 'boolean',
				},
				status: {
					type: 'string',
				},
				_id: {
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
			required: ['questions', 'code', 'deleted', 'status', '_id', 'updatedAt', 'createdAt', '__v'],
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
const readSchema = {
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
				_id: {
					type: 'string',
				},
				questions: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
						{
							type: 'string',
						},
					],
				},
				code: {
					type: 'string',
				},
				deleted: {
					type: 'boolean',
				},
				status: {
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
			required: ['_id', 'questions', 'code', 'deleted', 'status', 'updatedAt', 'createdAt', '__v'],
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
	createSchema,
	updateSchema,
	readSchema,
}
