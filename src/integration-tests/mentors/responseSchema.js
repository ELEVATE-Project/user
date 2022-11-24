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
				totalSessionCreated: {
					type: 'integer',
				},
				totalsessionHosted: {
					type: 'integer',
				},
			},
			required: ['totalSessionCreated', 'totalsessionHosted'],
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
				sessionsHosted: {
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
				'sessionsHosted',
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
const upcomingSessionsSchema = {
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
const shareSchema = {
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
	reportsSchema,
	profileSchema,
	upcomingSessionsSchema,
	shareSchema,
}
