class UserDTO {
	static transform(input) {
		// If it's an array of users
		if (Array.isArray(input)) {
			return input.map((user) => UserDTO.transformUser(user))
		}

		// If it's a single user
		return UserDTO.transformUser(input)
	}

	static transformUser(user) {
		return {
			id: user.id,
			email: user.email,
			email_verified: user.email_verified,
			name: user.name,
			username: user.username,
			phone: user.phone,
			phone_code: user.phone_code,
			location: user.location,
			about: user.about,
			share_link: user.share_link,
			status: user.status,
			image: user.image,
			has_accepted_terms_and_conditions: user.has_accepted_terms_and_conditions,
			languages: user.languages,
			preferred_language: user.preferred_language,
			tenant_code: user.tenant_code,
			meta: user.meta,
			created_at: user.created_at,
			updated_at: user.updated_at,
			deleted_at: user.deleted_at,
			organizations: (user.user_organizations || []).map((orgLink) => {
				const org = orgLink.organization || {}
				return {
					id: org.id,
					name: org.name,
					code: org.code,
					description: org.description,
					status: org.status,
					related_orgs: org.related_orgs,
					tenant_code: org.tenant_code,
					meta: org.meta,
					created_by: org.created_by,
					updated_by: org.updated_by,
					roles: (orgLink.roles || []).map((roleLink) => {
						const role = roleLink.role || {}
						return {
							id: role.id,
							title: role.title,
							label: role.label,
							user_type: role.user_type,
							status: role.status,
							organization_id: role.organization_id,
							visibility: role.visibility,
							tenant_code: role.tenant_code,
							translations: role.translations,
						}
					}),
				}
			}),
		}
	}
	static keysFilter(input) {
		const restrictedKeys = [
			'password',
			'created_at',
			'updated_at',
			'deleted_at',
			'email_verified',
			'share_link',
			'has_accepted_terms_and_conditions',
			'custom_entity_text',
			'tenant_code',
		]
		return input.filter((key) => !restrictedKeys.includes(key))
	}
	static eventBodyDTO({ entity, eventType, entityId, changedValues = [], args = {} }) {
		try {
			if (!entity || !eventType || !entityId)
				throw new Error('Entity, EventType & EntityId values are mandatory for an Event')

			const disallowedArgs = [
				'password',
				'created_at',
				'updated_at',
				'deleted_at',
				'email_verified',
				'share_link',
				'has_accepted_terms_and_conditions',
				'custom_entity_text',
			]

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

	static deleteEventBodyDTO({ entity, eventType, entityId, args = {} }) {
		try {
			if (!entity || !eventType || !entityId)
				throw new Error('Entity, EventType & EntityId values are mandatory for an Event')
			args = {
				id: args.id,
				username: args?.username || null,
				status: args?.status,
				tenant_code: args?.tenant_code,
				status: 'DELETED',
				deleted: true,
				created_by: args.created_by,
				email: args?.email || null,
				phone: args?.phone || null,
			}
			return {
				entity,
				eventType,
				entityId,
				...args,
			}
		} catch (error) {
			console.error(error)
			return false
		}
	}

	static userInviteDTO(input, prunedEntities) {
		let response = {
			...UserDTO.transformUser(input),
		}
		prunedEntities.forEach((entity) => {
			response[entity.value] = input[entity.value] || ''
		})
		return response
	}
}

module.exports = UserDTO
