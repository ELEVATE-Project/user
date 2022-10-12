const formCreateSchema = {
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
const formReadSchema = {
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
					type: 'object',
					properties: {
						templateName: {
							type: 'string',
						},
						fields: {
							type: 'object',
							properties: {
								controls: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												name: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												value: {
													type: 'string',
												},
												class: {
													type: 'string',
												},
												type: {
													type: 'string',
												},
												position: {
													type: 'string',
												},
												validators: {
													type: 'object',
													properties: {
														required: {
															type: 'boolean',
														},
														minLength: {
															type: 'integer',
														},
													},
													required: ['required', 'minLength'],
												},
											},
											required: [
												'name',
												'label',
												'value',
												'class',
												'type',
												'position',
												'validators',
											],
										},
										{
											type: 'object',
											properties: {
												name: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												value: {
													type: 'string',
												},
												class: {
													type: 'string',
												},
												type: {
													type: 'string',
												},
												position: {
													type: 'string',
												},
												disabled: {
													type: 'boolean',
												},
												showSelectAll: {
													type: 'boolean',
												},
												validators: {
													type: 'object',
													properties: {
														required: {
															type: 'boolean',
														},
													},
													required: ['required'],
												},
											},
											required: [
												'name',
												'label',
												'value',
												'class',
												'type',
												'position',
												'disabled',
												'showSelectAll',
												'validators',
											],
										},
									],
								},
							},
							required: ['controls'],
						},
					},
					required: ['templateName', 'fields'],
				},
				_id: {
					type: 'string',
				},
				type: {
					type: 'string',
				},
				subType: {
					type: 'string',
				},
				action: {
					type: 'string',
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
			required: ['data', '_id', 'type', 'subType', 'action', 'updatedAt', 'createdAt', '__v'],
		},
		meta: {
			type: 'object',
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const formUpdateSchema = {
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
	formCreateSchema,
	formReadSchema,
	formUpdateSchema,
}
