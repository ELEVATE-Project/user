const RolePermissionMapping = require('@database/models/index').RolePermission

exports.create = async (data) => {
	try {
		return RolePermissionMapping.create(data, { returning: true })
	} catch (error) {
		throw error
	}
}

exports.delete = async (filter) => {
	try {
		const deletedRows = await RolePermissionMapping.destroy({
			where: filter,
		})
		return deletedRows
	} catch (error) {
		throw error
	}
}

exports.find = async (filter) => {
	try {
		return RolePermissionMapping.findAll({
			where: { role_id: filter },
		})
	} catch (error) {
		throw error
	}
}
