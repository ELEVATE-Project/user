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
		responseCode: { type: 'string' },
		message: { type: 'string' },
		result: {
			type: 'object',
			properties: {
				access_token: { type: 'string' },
				refresh_token: { type: 'string' },
				user: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						email: { type: 'string' },
						email_verified: { type: 'string' },
						name: { type: 'string' },
						gender: { type: 'null' },
						location: { type: 'null' },
						about: { type: 'null' },
						share_link: { type: 'null' },
						status: { type: 'string' },
						image: { type: 'null' },
						last_logged_in_at: { type: 'null' },
						has_accepted_terms_and_conditions: { type: 'boolean' },
						refresh_tokens: { type: 'null' },
						languages: { type: 'null' },
						preferred_language: { type: 'string' },
						organization_id: { type: 'integer' },
						roles: { type: 'array', items: [{ type: 'integer' }] },
						custom_entity_text: { type: 'null' },
						meta: { type: 'null' },
						created_at: { type: 'string' },
						updated_at: { type: 'string' },
						deleted_at: { type: 'null' },
						user_roles: {
							type: 'array',
							items: [
								{
									type: 'object',
									properties: {
										id: { type: 'integer' },
										title: { type: 'string' },
										user_type: { type: 'integer' },
										status: { type: 'string' },
										organization_id: { type: 'integer' },
										visibility: { type: 'string' },
									},
									required: ['id', 'title', 'user_type', 'status', 'organization_id', 'visibility'],
								},
							],
						},
					},
					required: [
						'id',
						'email',
						'email_verified',
						'name',
						'gender',
						'location',
						'about',
						'share_link',
						'status',
						'image',
						'last_logged_in_at',
						'has_accepted_terms_and_conditions',
						'refresh_tokens',
						'languages',
						'preferred_language',
						'organization_id',
						'roles',
						'custom_entity_text',
						'meta',
						'created_at',
						'updated_at',
						'deleted_at',
						'user_roles',
					],
				},
			},
			required: ['access_token', 'refresh_token', 'user'],
		},
	},
	meta: {
		type: 'object',
		properties: {
			formsVersion: {
				type: 'array',
				items: [
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
				],
			},
			correlation: { type: 'string' },
		},
		required: ['formsVersion', 'correlation'],
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

const addOrgAdminSchema = {
	type: 'object',
	properties: {
		responseCode: { type: 'string' },
		message: { type: 'string' },
		result: {
			type: 'object',
			properties: {
				user_id: { type: 'integer' },
				organization_id: { type: 'integer' },
				user_roles: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: { type: 'integer' },
								title: { type: 'string' },
								user_type: { type: 'integer' },
								status: { type: 'string' },
								organization_id: { type: 'integer' },
								visibility: { type: 'string' },
							},
							required: ['id', 'title', 'user_type', 'status', 'organization_id', 'visibility'],
						},
						{
							type: 'object',
							properties: {
								id: { type: 'integer' },
								title: { type: 'string' },
								user_type: { type: 'integer' },
								status: { type: 'string' },
								organization_id: { type: 'integer' },
								visibility: { type: 'string' },
							},
							required: ['id', 'title', 'user_type', 'status', 'organization_id', 'visibility'],
						},
					],
				},
			},
			required: ['user_id', 'organization_id', 'user_roles'],
		},
	},
	meta: {
		type: 'object',
		properties: {
			formsVersion: {
				type: 'array',
				items: [
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
					{
						type: 'object',
						properties: { id: { type: 'integer' }, type: { type: 'string' }, version: { type: 'integer' } },
						required: ['id', 'type', 'version'],
					},
				],
			},
			correlation: { type: 'string' },
		},
		required: ['formsVersion', 'correlation'],
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

const deactivateOrgSchema = {
	type: 'object',
	properties: {
		responseCode: { type: 'string' },
		message: { type: 'string' },
		result: {
			type: 'object',
			properties: {
				deactivated_users: { type: 'integer' },
			},
			required: ['deactivated_users'],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: { type: 'integer' },
								type: { type: 'string' },
								version: { type: 'integer' },
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: { type: 'integer' },
								type: { type: 'string' },
								version: { type: 'integer' },
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: { type: 'integer' },
								type: { type: 'string' },
								version: { type: 'integer' },
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: { type: 'integer' },
								type: { type: 'string' },
								version: { type: 'integer' },
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: { type: 'integer' },
								type: { type: 'string' },
								version: { type: 'integer' },
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: { type: 'integer' },
								type: { type: 'string' },
								version: { type: 'integer' },
							},
							required: ['id', 'type', 'version'],
						},
					],
				},
				correlation: { type: 'string' },
			},
			required: ['formsVersion', 'correlation'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

module.exports = {
	createSystemUserSchema,
	loginSchema,
	addOrgAdminSchema,
	deactivateOrgSchema,
}
