let commonBody = {
	properties: {
		message: {
			type: 'string',
		},
		meta: {
			type: 'object',
		},
		responseCode: {
			type: 'string',
		},
		result: {
			properties: {
				access_token: {
					type: 'string',
				},
				refresh_token: {
					type: 'string',
				},
				user: {
					properties: {
						_id: {
							type: 'string',
						},
						areasOfExpertise: {
							items: {},
							type: 'array',
						},
						createdAt: {
							type: 'string',
						},
						deleted: {
							type: 'boolean',
						},
						designation: {
							items: {},
							type: 'array',
						},
						educationQualification: {
							type: 'null',
						},
						email: {
							properties: {
								address: {
									type: 'string',
								},
								verified: {
									type: 'boolean',
								},
							},
							required: ['address', 'verified'],
							type: 'object',
						},
						hasAcceptedTAndC: {
							type: 'boolean',
						},
						isAMentor: {
							type: 'boolean',
						},
						languages: {
							items: {},
							type: 'array',
						},
						location: {
							items: {},
							type: 'array',
						},
						name: {
							type: 'string',
						},
						updatedAt: {
							type: 'string',
						},
					},
					required: [
						'email',
						'_id',
						'name',
						'isAMentor',
						'hasAcceptedTAndC',
						'deleted',
						'educationQualification',
						'designation',
						'location',
						'areasOfExpertise',
						'languages',
						'updatedAt',
						'createdAt',
					],
					type: 'object',
				},
			},
			required: ['access_token', 'refresh_token', 'user'],
			type: 'object',
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
