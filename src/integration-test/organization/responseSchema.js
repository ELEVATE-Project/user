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
				status: {
					type: 'string',
				},
				id: {
					type: 'integer',
				},
				name: {
					type: 'string',
				},
				code: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				created_by: {
					type: 'integer',
				},
				updated_at: {
					type: 'string',
				},
				created_at: {
					type: 'string',
				},
				org_admin: {
					type: 'null',
				},
				parent_id: {
					type: 'null',
				},
				related_orgs: {
					type: 'null',
				},
				in_domain_visibility: {
					type: 'null',
				},
				updated_by: {
					type: 'null',
				},
				deleted_at: {
					type: 'null',
				},
			},
			required: [
				'status',
				'id',
				'name',
				'code',
				'description',
				'created_by',
				'updated_at',
				'created_at',
				'org_admin',
				'parent_id',
				'related_orgs',
				'in_domain_visibility',
				'updated_by',
				'deleted_at',
			],
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

const readSchema = {
	type: 'object',
	properties: {
		responseCode: { type: 'string' },
		message: { type: 'string' },
		result: {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				name: { type: 'string' },
				code: { type: 'string' },
				description: { type: 'string' },
				status: { type: 'string' },
				org_admin: {
					type: 'array',
					items: { type: 'integer' },
				},
				parent_id: { type: ['null', 'integer'] },
				related_orgs: { type: ['null', 'array'] },
				in_domain_visibility: { type: ['null', 'array'] },
				created_by: { type: ['null', 'integer'] },
				updated_by: { type: 'integer' },
				created_at: { type: 'string' },
				updated_at: { type: 'string' },
				deleted_at: { type: ['null', 'string'] },
			},
			required: [
				'id',
				'name',
				'code',
				'description',
				'status',
				'org_admin',
				'parent_id',
				'related_orgs',
				'in_domain_visibility',
				'created_by',
				'updated_by',
				'created_at',
				'updated_at',
				'deleted_at',
			],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'integer' },
							type: { type: 'string' },
							version: { type: 'integer' },
						},
						required: ['id', 'type', 'version'],
					},
				},
				correlation: { type: 'string' },
			},
			required: ['formsVersion', 'correlation'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

const updateSchema = {
	type: 'object',
	properties: {
		responseCode: { type: 'string' },
		message: { type: 'string' },
		result: {
			type: 'array',
			items: {},
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'integer' },
							type: { type: 'string' },
							version: { type: 'integer' },
						},
						required: ['id', 'type', 'version'],
					},
				},
				correlation: { type: 'string' },
			},
			required: ['formsVersion', 'correlation'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

module.exports = { createSchema, readSchema, updateSchema }
