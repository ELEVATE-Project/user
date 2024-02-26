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
		responseCode: { type: 'string' },
		message: { type: 'string' },
		result: {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				type: { type: 'string' },
				sub_type: { type: 'string' },
				data: {
					type: 'object',
					properties: {
						template_name: { type: 'string' },
						fields: {
							type: 'object',
							properties: {
								controls: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												name: { type: 'string' },
												label: { type: 'string' },
												value: { type: 'string' },
												class: { type: 'string' },
												type: { type: 'string' },
												position: { type: 'string' },
												placeHolder: { type: 'string' },
												errorMessage: { type: 'string' },
												showValidationError: { type: 'boolean' },
												validators: {
													type: 'object',
													properties: {
														required: { type: 'boolean' },
														pattern: { type: 'string' },
													},
													required: ['required', 'pattern'],
												},
												options: { type: 'array', items: {} },
											},
											required: [
												'name',
												'label',
												'value',
												'class',
												'type',
												'position',
												'placeHolder',
												'errorMessage',
												'showValidationError',
												'validators',
												'options',
											],
										},
										{
											type: 'object',
											properties: {
												name: { type: 'string' },
												label: { type: 'string' },
												value: {
													type: 'array',
													items: [
														{
															type: 'object',
															properties: {
																value: { type: 'string' },
																label: { type: 'string' },
															},
															required: ['value', 'label'],
														},
													],
												},
												class: { type: 'string' },
												type: { type: 'string' },
												position: { type: 'string' },
												errorLabel: { type: 'string' },
												errorMessage: { type: 'string' },
												validators: {
													type: 'object',
													properties: {
														required: { type: 'boolean' },
													},
													required: ['required'],
												},
												options: {
													type: 'array',
													items: [
														{
															type: 'object',
															properties: {
																value: { type: 'string' },
																label: { type: 'string' },
															},
															required: ['value', 'label'],
														},
														{
															type: 'object',
															properties: {
																value: { type: 'string' },
																label: { type: 'string' },
															},
															required: ['value', 'label'],
														},
													],
												},
											},
											required: [
												'name',
												'label',
												'value',
												'class',
												'type',
												'position',
												'errorLabel',
												'errorMessage',
												'validators',
												'options',
											],
										},
									],
								},
							},
						},
					},
					required: ['template_name', 'fields'],
				},
				version: { type: 'integer' },
				organization_id: { type: 'integer' },
				created_at: { type: 'string' },
				updated_at: { type: 'string' },
				deleted_at: { type: 'null' },
			},
			required: [
				'id',
				'type',
				'sub_type',
				'data',
				'version',
				'organization_id',
				'created_at',
				'updated_at',
				'deleted_at',
			],
		},
	},
	meta: {
		type: 'object',
		properties: {
			formsVersion: {
				type: 'array',
				items: [
					{
						type: 'object',
						properties: {
							id: { type: 'integer' },
							type: { type: 'string' },
							version: { type: 'integer' },
						},
						required: ['id', 'type', 'version'],
					},
				],
			},
			correlation: { type: 'string' },
		},
		required: ['formsVersion', 'correlation'],
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
