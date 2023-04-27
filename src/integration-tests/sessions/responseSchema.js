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
				title: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				recommendedFor: {
					type: 'array',
					items: [
						{
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
					],
				},
				categories: {
					type: 'array',
					items: [
						{
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
					],
				},
				medium: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								label: {
									type: 'string',
								},
								value: {
									type: 'string',
								},
							},
							required: ['label', 'value'],
						},
					],
				},
				image: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
					],
				},
				userId: {
					type: 'string',
				},
				status: {
					type: 'string',
				},
				deleted: {
					type: 'boolean',
				},
				timeZone: {
					type: 'string',
				},
				startDate: {
					type: 'string',
				},
				endDate: {
					type: 'string',
				},
				startDateUtc: {
					type: 'string',
				},
				endDateUtc: {
					type: 'string',
				},
				skippedFeedback: {
					type: 'boolean',
				},
				isStarted: {
					type: 'boolean',
				},
				menteeFeedbackForm: {
					type: 'string',
				},
				mentorFeedbackForm: {
					type: 'string',
				},
				recordingUrl: {
					type: 'null',
				},
				_id: {
					type: 'string',
				},
				feedbacks: {
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
				'title',
				'description',
				'recommendedFor',
				'categories',
				'medium',
				'image',
				'userId',
				'status',
				'deleted',
				'timeZone',
				'startDate',
				'endDate',
				'startDateUtc',
				'endDateUtc',
				'skippedFeedback',
				'isStarted',
				'menteeFeedbackForm',
				'mentorFeedbackForm',
				'recordingUrl',
				'_id',
				'feedbacks',
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
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const deleteSchema = {
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
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const startSchema = {
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
					items: {},
				},
			},
			required: ['formsVersion'],
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
								_id: {
									type: 'string',
								},
								title: {
									type: 'string',
								},
								description: {
									type: 'string',
								},
								image: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
									],
								},
								userId: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
								startDate: {
									type: 'string',
								},
								endDate: {
									type: 'string',
								},
								startDateUtc: {
									type: 'string',
								},
								endDateUtc: {
									type: 'string',
								},
								createdAt: {
									type: 'string',
								},
								mentorName: {
									type: 'string',
								},
							},
							required: [
								'_id',
								'title',
								'description',
								'image',
								'userId',
								'status',
								'startDate',
								'endDate',
								'startDateUtc',
								'endDateUtc',
								'createdAt',
								'mentorName',
							],
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
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const detailsSchema = {
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
				title: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				recommendedFor: {
					type: 'array',
					items: [
						{
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
					],
				},
				categories: {
					type: 'array',
					items: [
						{
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
					],
				},
				medium: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								label: {
									type: 'string',
								},
								value: {
									type: 'string',
								},
							},
							required: ['label', 'value'],
						},
					],
				},
				image: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
					],
				},
				userId: {
					type: 'string',
				},
				status: {
					type: 'string',
				},
				deleted: {
					type: 'boolean',
				},
				timeZone: {
					type: 'string',
				},
				startDate: {
					type: 'string',
				},
				endDate: {
					type: 'string',
				},
				startDateUtc: {
					type: 'string',
				},
				endDateUtc: {
					type: 'string',
				},
				skippedFeedback: {
					type: 'boolean',
				},
				isStarted: {
					type: 'boolean',
				},
				menteeFeedbackForm: {
					type: 'string',
				},
				mentorFeedbackForm: {
					type: 'string',
				},
				recordingUrl: {
					type: 'null',
				},
				feedbacks: {
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
				isEnrolled: {
					type: 'boolean',
				},
				mentorName: {
					type: 'string',
				},
			},
			required: [
				'_id',
				'title',
				'description',
				'recommendedFor',
				'categories',
				'medium',
				'image',
				'userId',
				'status',
				'deleted',
				'timeZone',
				'startDate',
				'endDate',
				'startDateUtc',
				'endDateUtc',
				'skippedFeedback',
				'isStarted',
				'menteeFeedbackForm',
				'mentorFeedbackForm',
				'recordingUrl',
				'feedbacks',
				'updatedAt',
				'createdAt',
				'__v',
				'isEnrolled',
				'mentorName',
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
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const updateRecordingUrlSchema = {
	$schema: 'http://json-schema.org/draft-04/schema#',
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
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const enrollSchema = {
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
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const unenrollSchema = {
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
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

module.exports = {
	createSchema,
	deleteSchema,
	updateSchema,
	startSchema,
	listSchema,
	detailsSchema,
	shareSchema,
	updateRecordingUrlSchema,
	enrollSchema,
	unenrollSchema,
}
