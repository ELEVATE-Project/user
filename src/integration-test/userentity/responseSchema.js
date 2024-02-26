const createEntitySchema = {
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
				value: {
					type: 'string',
				},
				label: {
					type: 'string',
				},
				status: {
					type: 'string',
				},
				deleted_at: {
					type: 'null',
				},
				type: {
					type: 'string',
				},
				created_by: {
					type: 'integer',
				},
				updated_by: {
					type: 'integer',
				},
				id: {
					type: 'integer',
				},
				updated_at: {
					type: 'string',
				},
				created_at: {
					type: 'string',
				},
				entity_type_id: {
					type: 'integer',
				},
			},
			required: [
				'value',
				'label',
				'status',
				'deleted_at',
				'type',
				'created_by',
				'updated_by',
				'id',
				'updated_at',
				'created_at',
				'entity_type_id',
			],
		},
	},
	required: ['responseCode', 'message', 'result'],
}
const readEntitySchema = {
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
const updateEntitySchema = {
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
const deleteEntitySchema = {
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
	createEntitySchema,
	readEntitySchema,
	updateEntitySchema,
	deleteEntitySchema,
}
