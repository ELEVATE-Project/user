class organizationDTO {
	static transform(input) {
		return {
			id: input.id,
			name: input.name,
			description: input.description,
			status: input.status,
			meta: input.meta,
		}
	}
}

module.exports = organizationDTO
