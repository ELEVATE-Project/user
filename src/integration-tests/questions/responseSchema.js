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
				question: {
					type: 'string',
				},
				options: {
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
				deleted: {
					type: 'boolean',
				},
				validators: {
					type: 'object',
					properties: {
						required: {
							type: 'boolean',
						},
					},
					required: ['required'],
				},
				value: {
					type: 'string',
				},
				hint: {
					type: 'string',
				},
				disable: {
					type: 'boolean',
				},
				visible: {
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
			required: [
				'question',
				'options',
				'deleted',
				'validators',
				'value',
				'hint',
				'disable',
				'visible',
				'status',
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
					type: 'array',
					items: [
						{
							type: 'object',
						},
					],
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
					items: [
						{
							type: 'object',
						},
					],
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
				question: {
					type: 'string',
				},
				options: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
						{
							type: 'string',
						},
						{
							type: 'string',
						},
					],
				},
				deleted: {
					type: 'boolean',
				},
				validators: {
					type: 'object',
					properties: {
						required: {
							type: 'boolean',
						},
					},
					required: ['required'],
				},
				value: {
					type: 'string',
				},
				hint: {
					type: 'string',
				},
				disable: {
					type: 'boolean',
				},
				visible: {
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
			required: [
				'_id',
				'question',
				'options',
				'deleted',
				'validators',
				'value',
				'hint',
				'disable',
				'visible',
				'status',
				'updatedAt',
				'createdAt',
				'__v',
			],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: [
						{
							type: 'object',
						},
					],
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
