const profileUpdateSchema = {
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
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const profileDetailsSchema = {
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
				'lastLoggedInAt',
			],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const profileShareSchema = {
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
				shareLink: {
					type: 'string',
				},
			},
			required: ['shareLink'],
		},
		meta: {
			type: 'object',
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
module.exports = {
	profileUpdateSchema,
	profileDetailsSchema,
	profileShareSchema,
}
