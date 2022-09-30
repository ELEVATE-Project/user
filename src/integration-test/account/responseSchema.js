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
						_id: {
							type: 'string',
						},
						name: {
							type: 'string',
						},
						isAMentor: {
							type: 'boolean',
						},
						hasAcceptedTAndC: {
							type: 'boolean',
						},
						deleted: {
							type: 'boolean',
						},
						educationQualification: {
							type: 'null',
						},
						designation: {
							type: 'array',
							items: {},
						},
						location: {
							type: 'array',
							items: {},
						},
						areasOfExpertise: {
							type: 'array',
							items: {},
						},
						languages: {
							type: 'array',
							items: {},
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
						'__v',
					],
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
						_id: {
							type: 'string',
						},
						name: {
							type: 'string',
						},
						isAMentor: {
							type: 'boolean',
						},
						hasAcceptedTAndC: {
							type: 'boolean',
						},
						deleted: {
							type: 'boolean',
						},
						educationQualification: {
							type: 'null',
						},
						designation: {
							type: 'array',
							items: {},
						},
						location: {
							type: 'array',
							items: {},
						},
						areasOfExpertise: {
							type: 'array',
							items: {},
						},
						languages: {
							type: 'array',
							items: {},
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
						lastLoggedInAt: {
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
						'__v',
					],
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

module.exports = {
	createProfileSchema,
	generateTokenSchema,
	verifyUser,
	verifyMentor,
	loginSchema,
	logoutSchema,
	changeRoleSchema,
}
