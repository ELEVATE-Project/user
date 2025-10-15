class organizationDTO {
	static transform(input) {
		return {
			id: input.id,
			name: input.name,
			code: input.code,
			description: input.description,
			status: input.status,
			meta: input.meta,
			registration_codes: input?.registration_codes || [],
		}
	}

	static eventBodyDTO({ entity, eventType, entityId, oldValues, newValues, args = {} }) {
		try {
			if (!entity || !eventType || !entityId)
				throw new Error('Entity, EventType & EntityId values are mandatory for an Event')

			const disallowedArgs = ['deleted_at']
			disallowedArgs.forEach((key) => delete args[key])

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

module.exports = organizationDTO
