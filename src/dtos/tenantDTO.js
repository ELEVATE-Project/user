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

	static eventBodyDTO({ entity, eventType, entityId, oldValues, newValues, args = {} }) {
		try {
			if (!entity || !eventType || !entityId)
				throw new Error('Entity, EventType & EntityId values are mandatory for an Event')

			const disallowedArgs = ['deleted_at']

			disallowedArgs.forEach((key) => {
				delete args[key]
			})

			return {
				entity,
				eventType,
				entityId,
				...(oldValues ? { oldValues } : {}),
				...(newValues ? { newValues } : {}),
				...args,
			}
		} catch (error) {
			console.error(error)
			return false
		}
	}
}

module.exports = TenantResponseDTO
