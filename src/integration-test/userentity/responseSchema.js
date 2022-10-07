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
				deleted: {
					type: 'boolean',
				},
				type: {
					type: 'string',
				},
				createdBy: {
					type: 'string',
				},
				updatedBy: {
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
			required: [
				'value',
				'label',
				'status',
				'deleted',
				'type',
				'createdBy',
				'updatedBy',
				'_id',
				'updatedAt',
				'createdAt',
				'__v',
			],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'object',
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

module.exports = {
	createEntitySchema,
	deleteEntity,
}
