class TenantResponseDTO {
	static publicTransform(input) {
		return {
			code: input.tenant.code,
			name: input.tenant.name,
			status: input.tenant.status,
			description: input.tenant.description,
			logo: input.tenant.logo,
			theming: input.tenant.theming,
			meta: input.tenant.meta,

			...(input.organization && {
				organization: {
					name: input.organization.name,
					code: input.organization.code,
					description: input.organization.description,
					status: input.organization.status,
				},
			}),
		}
	}
}

module.exports = TenantResponseDTO
