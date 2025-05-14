class organizationDTO {
	static transform(input) {
		return {
			id: input.id,
			name: input.name,
			code: input.code,
			description: input.description,
			status: input.status,
			meta: input.meta,
		}
	}
}

module.exports = organizationDTO
