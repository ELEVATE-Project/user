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
const menteeListSchema = {
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
												email: {
													type: 'string',
												},
												about: {
													type: 'null',
												},
												image: {
													type: 'null',
												},
												organization: {
													type: 'object',
													properties: {
														id: {
															type: 'integer',
														},
														code: {
															type: 'string',
														},
														name: {
															type: 'string',
														},
													},
													required: ['id', 'code', 'name'],
												},
												designation: {
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
												area_of_expertise: {
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
												education_qualification: {
													type: 'string',
												},
											},
											required: [
												'id',
												'name',
												'about',
												'image',
												'organization',
												'designation',
												'area_of_expertise',
												'education_qualification',
											],
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
												about: {
													type: 'null',
												},
												image: {
													type: 'null',
												},
												organization: {
													type: 'object',
													properties: {
														id: {
															type: 'integer',
														},
														code: {
															type: 'string',
														},
														name: {
															type: 'string',
														},
													},
													required: ['id', 'code', 'name'],
												},
												designation: {
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
												area_of_expertise: {
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
												education_qualification: {
													type: 'string',
												},
											},
											required: [
												'id',
												'name',
												'about',
												'image',
												'organization',
												'designation',
												'area_of_expertise',
												'education_qualification',
											],
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
				correlation: {
					type: 'string',
				},
				meetingPlatform: {
					type: 'string',
				},
			},
			required: ['correlation', 'meetingPlatform'],
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
	menteeListSchema,
}
