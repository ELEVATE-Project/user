const sessionsSchema = {
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
			items: [
				{
					type: 'object',
					properties: {
						data: {
							type: 'array',
							items: {},
						},
					},
					required: ['data'],
				},
			],
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
const profileSchema = {
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
				sessionsAttended: {
					type: 'integer',
				},
				_id: {
					type: 'string',
				},
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
				lastLoggedInAt: {
					type: 'string',
				},
			},
			required: [
				'sessionsAttended',
				'_id',
				'email',
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
const reportsSchema = {
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
				totalSessionEnrolled: {
					type: 'integer',
				},
				totalsessionsAttended: {
					type: 'integer',
				},
			},
			required: ['totalSessionEnrolled', 'totalsessionsAttended'],
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
const homeFeedSchema = {
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
				allSessions: {
					type: 'array',
					items: [
						{
							type: 'object',
						},
					],
				},
				mySessions: {
					type: 'array',
					items: [
						{
							type: 'object',
						},
					],
				},
			},
			required: ['allSessions', 'mySessions'],
		},
		meta: {
			type: 'object',
			properties: {
				type: {
					type: 'string',
				},
				data: {
					type: 'array',
					items: {},
				},
				formsVersion: {
					type: 'array',
					items: {},
				},
			},
			required: ['type', 'data', 'formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const joinSessionSchema = {
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
				link: {
					type: 'string',
				},
			},
			required: ['link'],
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
	sessionsSchema,
	profileSchema,
	reportsSchema,
	homeFeedSchema,
	joinSessionSchema,
}
