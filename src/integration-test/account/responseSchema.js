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
						has_accepted_terms_and_conditions: {
							type: 'boolean',
						},
						languages: {
							type: 'null',
						},
						preferred_language: {
							type: 'object',
							properties: {
								value: {
									type: 'string',
								},
								label: {
									type: 'string',
								},
							},
							required: ['value', 'label'],
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
								{
									type: 'integer',
								},
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
						organization: {
							type: 'object',
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
										organization_id: {
											type: 'integer',
										},
										visibility: {
											type: 'string',
										},
									},
									required: ['id', 'title', 'user_type', 'status', 'organization_id', 'visibility'],
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
										status: {
											type: 'string',
										},
										organization_id: {
											type: 'integer',
										},
										visibility: {
											type: 'string',
										},
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
						'has_accepted_terms_and_conditions',
						'languages',
						'preferred_language',
						'organization_id',
						'roles',
						'meta',
						'created_at',
						'updated_at',
						'deleted_at',
						'organization',
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
	...commonBody,
}
commonBody.properties.result.properties.user.properties['lastLoggedInAt'] = {
	type: 'string',
}
const loginSchema = {
	type: 'object',
	...commonBody,
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
}
