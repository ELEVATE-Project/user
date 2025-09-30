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

	static eventBodyDTO({ entity, eventType, entityId, changedValues = [], args = {} }) {
		try {
			if (!entity || !eventType || !entityId)
				throw new Error('Entity, EventType & EntityId values are mandatory for an Event')

			const disallowedArgs = ['deleted_at']

			disallowedArgs.forEach((key) => {
				delete args[key]
			})

			const changes = changedValues.reduce((result, obj) => {
				const { fieldName, oldValue, newValue } = obj
				if (!result[fieldName]) result[fieldName] = {}
				if (oldValue) result[fieldName].oldValue = oldValue
				if (newValue) result[fieldName].newValue = newValue
				return result
			}, {})
			return {
				entity,
				eventType,
				entityId,
				changes,
				...args,
			}
		} catch (error) {
			console.error(error)
			return false
		}
	}
}

module.exports = organizationDTO
