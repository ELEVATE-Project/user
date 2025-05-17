class UserDTO {
	static transform(input) {
		return {
			id: input.id,
			email: input.email,
			email_verified: input.email_verified,
			name: input.name,
			username: input.username,
			phone: input.phone,
			phone_code: input.phone_code,
			location: input.location,
			about: input.about,
			share_link: input.share_link,
			status: input.status,
			image: input.image,
			has_accepted_terms_and_conditions: input.has_accepted_terms_and_conditions,
			languages: input.languages,
			preferred_language: input.preferred_language,
			tenant_code: input.tenant_code,
			meta: input.meta,
			created_at: input.created_at,
			updated_at: input.updated_at,
			deleted_at: input.deleted_at,
			organizations: input.user_organizations.map((org) => ({
				id: org.organization.id,
				name: org.organization.name,
				code: org.organization.code,
				description: org.organization.description,
				status: org.organization.status,
				//org_admin: org.organization.org_admin,
				//parent_id: org.organization.parent_id,
				related_orgs: org.organization.related_orgs,
				//in_domain_visibility: org.organization.in_domain_visibility,
				tenant_code: org.organization.tenant_code,
				meta: org.organization.meta,
				created_by: org.organization.created_by,
				updated_by: org.organization.updated_by,
				//created_at: org.organization.created_at,
				//updated_at: org.organization.updated_at,
				//deleted_at: org.organization.deleted_at,
				roles: org.roles.map((role) => ({
					id: role.role.id,
					title: role.role.title,
					label: role.role.label,
					user_type: role.role.user_type,
					status: role.role.status,
					organization_id: role.role.organization_id,
					visibility: role.role.visibility,
					tenant_code: role.role.tenant_code,
					translations: role.role.translations,
					//created_at: role.role.created_at,
					//updated_at: role.role.updated_at,
					//deleted_at: role.role.deleted_at,
				})),
			})),
		}
	}
	static eventBodyDTO({ entity, eventType, entityId, changedValues = [], args = {} }) {
		try {
			if (!entity || !eventType || !entityId)
				throw new Error('Entity, EventType & EntityId values are mandatory for an Event')
			const allowedArgs = [
				'name',
				'username',
				'email',
				'phone',
				'organization_id',
				'tenant_code',
				'status',
				'deleted',
				'id',
				'meta',
				'user_roles',
				'created_at',
				'created_by',
				'updated_at',
				'updated_by',
			]
			const disallowedArgs = Object.keys(args).filter((arg) => !allowedArgs.includes(arg))
			if (disallowedArgs.length > 0)
				throw new Error(`Event Args contain disallowed keys: ${disallowedArgs.join(', ')}`)
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

module.exports = UserDTO
