const validateRoleAccess = (roles, requiredRoles) => {
	if (!roles || roles.length === 0) return false

	if (!Array.isArray(requiredRoles)) {
		requiredRoles = [requiredRoles]
	}

	return roles.some((role) => requiredRoles.includes(role.title))
}

const getRoleTitlesFromId = (roleIds = [], roleList = []) => {
	return roleIds.map((roleId) => {
		const role = roleList.find((r) => r.id === roleId)
		return role ? role.title : null
	})
}

const role = {
	validateRoleAccess,
	getRoleTitlesFromId,
}

module.exports = role
