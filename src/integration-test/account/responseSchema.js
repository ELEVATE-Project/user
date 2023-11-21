let commonBody = {
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
						id: {
							type: 'integer',
						},
						email: {
							type: 'string',
						},
						email_verified: {
							type: 'string',
						},
						name: {
							type: 'string',
						},
						gender: {
							type: 'null',
						},
						location: {
							type: 'null',
						},
						about: {
							type: 'null',
						},
						share_link: {
							type: 'null',
						},
						status: {
							type: 'string',
						},
						image: {
							type: 'null',
						},
						last_logged_in_at: {
							type: 'null',
						},
						has_accepted_terms_and_conditions: {
							type: 'boolean',
						},
						status_updated_at: {
							type: 'null',
						},
						languages: {
							type: 'null',
						},
						preferred_language: {
							type: 'string',
						},
						organization_id: {
							type: 'integer',
						},
						roles: {
							type: 'array',
							items: [
								{
									type: 'integer',
								},
							],
						},
						custom_entity_text: {
							type: 'null',
						},
						meta: {
							type: 'null',
						},
						created_at: {
							type: 'string',
						},
						updated_at: {
							type: 'string',
						},
						deleted_at: {
							type: 'null',
						},
						user_roles: {
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
										status: {
											type: 'string',
										},
									},
									required: ['id', 'title', 'user_type', 'status'],
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
						'status_updated_at',
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

const createProfileSchema = {
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
						id: {
							type: 'integer',
						},
						email: {
							type: 'string',
						},
						email_verified: {
							type: 'string',
						},
						name: {
							type: 'string',
						},
						gender: {
							type: 'null',
						},
						location: {
							type: 'null',
						},
						about: {
							type: 'null',
						},
						share_link: {
							type: 'null',
						},
						status: {
							type: 'string',
						},
						image: {
							type: 'null',
						},
						last_logged_in_at: {
							type: 'null',
						},
						has_accepted_terms_and_conditions: {
							type: 'boolean',
						},
						status_updated_at: {
							type: 'null',
						},
						languages: {
							type: 'null',
						},
						preferred_language: {
							type: 'string',
						},
						organization_id: {
							type: 'integer',
						},
						roles: {
							type: 'array',
							items: [
								{
									type: 'integer',
								},
							],
						},
						custom_entity_text: {
							type: 'null',
						},
						meta: {
							type: 'null',
						},
						created_at: {
							type: 'string',
						},
						updated_at: {
							type: 'string',
						},
						deleted_at: {
							type: 'null',
						},
						user_roles: {
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
										status: {
											type: 'string',
										},
									},
									required: ['id', 'title', 'user_type', 'status'],
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
						'status_updated_at',
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

commonBody.properties.result.properties.user.properties['lastLoggedInAt'] = {
	type: 'string',
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
						id: {
							type: 'integer',
						},
						email: {
							type: 'string',
						},
						email_verified: {
							type: 'string',
						},
						name: {
							type: 'string',
						},
						gender: {
							type: 'null',
						},
						location: {
							type: 'null',
						},
						about: {
							type: 'null',
						},
						share_link: {
							type: 'null',
						},
						status: {
							type: 'string',
						},
						image: {
							type: 'null',
						},
						last_logged_in_at: {
							type: 'string',
						},
						has_accepted_terms_and_conditions: {
							type: 'boolean',
						},
						status_updated_at: {
							type: 'null',
						},
						languages: {
							type: 'null',
						},
						preferred_language: {
							type: 'string',
						},
						organization_id: {
							type: 'integer',
						},
						roles: {
							type: 'array',
							items: [
								{
									type: 'integer',
								},
							],
						},
						meta: {
							type: 'null',
						},
						created_at: {
							type: 'string',
						},
						updated_at: {
							type: 'string',
						},
						deleted_at: {
							type: 'null',
						},
						user_roles: {
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
										status: {
											type: 'string',
										},
									},
									required: ['id', 'title', 'user_type', 'status'],
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
						'status_updated_at',
						'languages',
						'preferred_language',
						'organization_id',
						'roles',
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

const generateTokenSchema = {
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
			},
			required: ['access_token'],
		},
		meta: {
			type: 'object',
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const verifyUser = {
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
				isAMentor: {
					type: 'boolean',
				},
			},
			required: ['_id', 'isAMentor'],
		},
		meta: {
			type: 'object',
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const verifyMentor = {
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
				isAMentor: {
					type: 'boolean',
				},
			},
			required: ['_id', 'isAMentor'],
		},
		meta: {
			type: 'object',
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const logoutSchema = {
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
const changeRoleSchema = {
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
const acceptTermsAndConditionSchema = {
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
												id: {
													type: 'integer',
												},
												name: {
													type: 'string',
												},
												image: {
													type: 'null',
												},
											},
											required: ['id', 'name', 'image'],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'integer',
												},
												name: {
													type: 'string',
												},
												image: {
													type: 'null',
												},
											},
											required: ['id', 'name', 'image'],
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
				correlation: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const reActivateTokenSchema = {
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
				correlation: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const reActivateSchema = {
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
				accessToken: {
					type: 'string',
				},
				refreshToken: {
					type: 'string',
				},
				user: {
					type: 'object',
					properties: {
						id: {
							type: 'integer',
						},
						email: {
							type: 'string',
						},
						email_verified: {
							type: 'string',
						},
						password: {
							type: 'string',
						},
						name: {
							type: 'string',
						},
						gender: {
							type: 'null',
						},
						location: {
							type: 'null',
						},
						about: {
							type: 'null',
						},
						share_link: {
							type: 'null',
						},
						status: {
							type: 'string',
						},
						image: {
							type: 'null',
						},
						last_logged_in_at: {
							type: 'string',
						},
						has_accepted_terms_and_conditions: {
							type: 'boolean',
						},
						status_updated_at: {
							type: 'null',
						},
						refresh_tokens: {
							type: 'array',
							items: [
								{
									type: 'object',
									properties: {
										exp: {
											type: 'integer',
										},
										token: {
											type: 'string',
										},
										userId: {
											type: 'integer',
										},
									},
									required: ['exp', 'token', 'userId'],
								},
								{
									type: 'object',
									properties: {
										exp: {
											type: 'integer',
										},
										token: {
											type: 'string',
										},
										userId: {
											type: 'integer',
										},
									},
									required: ['exp', 'token', 'userId'],
								},
							],
						},
						languages: {
							type: 'null',
						},
						preferred_language: {
							type: 'string',
						},
						organization_id: {
							type: 'integer',
						},
						roles: {
							type: 'array',
							items: [
								{
									type: 'integer',
								},
							],
						},
						custom_entity_text: {
							type: 'null',
						},
						meta: {
							type: 'null',
						},
						created_at: {
							type: 'string',
						},
						updated_at: {
							type: 'string',
						},
						deleted_at: {
							type: 'null',
						},
					},
					required: [
						'id',
						'email',
						'email_verified',
						'password',
						'name',
						'gender',
						'location',
						'about',
						'share_link',
						'status',
						'image',
						'last_logged_in_at',
						'has_accepted_terms_and_conditions',
						'status_updated_at',
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
					],
				},
			},
			required: ['accessToken', 'refreshToken', 'user'],
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
	createProfileSchema,
	generateTokenSchema,
	verifyUser,
	verifyMentor,
	loginSchema,
	logoutSchema,
	changeRoleSchema,
	acceptTermsAndConditionSchema,
	listSchema,
	reActivateTokenSchema,
	reActivateSchema,
}
