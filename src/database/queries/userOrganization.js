'use strict'

const { UserOrganization, Organization, UserOrganizationRole, sequelize } = require('@database/models/index')

exports.create = async (data, options = {}) => {
	try {
		const createdUserOrg = await UserOrganization.create(data, options)
		return createdUserOrg.get({ plain: true })
	} catch (error) {
		console.error(error)
		throw error
	}
}

exports.changeUserOrganization = async ({ userId, tenantCode, oldOrgCode, newOrgCode }) => {
	const transaction = await sequelize.transaction()

	try {
		// Get all roles for the user in the old organization
		const oldRoles = await UserOrganizationRole.findAll({
			where: {
				user_id: userId,
				tenant_code: tenantCode,
				organization_code: oldOrgCode,
			},
			transaction,
		})

		// Update or create the user_organizations entry for the new organization
		await UserOrganization.upsert(
			{
				user_id: userId,
				tenant_code: tenantCode,
				organization_code: newOrgCode,
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				transaction,
				conflictFields: ['tenant_code', 'user_id', 'organization_code'],
			}
		)

		// Delete the old user_organizations entry
		await UserOrganization.destroy({
			where: {
				user_id: userId,
				tenant_code: tenantCode,
				organization_code: oldOrgCode,
			},
			transaction,
		})

		// Delete old roles
		await UserOrganizationRole.destroy({
			where: {
				user_id: userId,
				tenant_code: tenantCode,
				organization_code: oldOrgCode,
			},
			transaction,
		})

		// Create new roles for the new organization
		const newRoles = oldRoles.map((role) => ({
			tenant_code: tenantCode,
			user_id: userId,
			organization_code: newOrgCode,
			role_id: role.role_id,
			created_at: new Date(),
			updated_at: new Date(),
		}))

		if (newRoles.length > 0) {
			await UserOrganizationRole.bulkCreate(newRoles, {
				transaction,
			})
		}

		// Commit the transaction
		await transaction.commit()

		return {
			success: true,
			message: `User ${userId} moved from organization ${oldOrgCode} to ${newOrgCode} with ${newRoles.length} roles migrated`,
		}
	} catch (error) {
		// Rollback the transaction on error
		await transaction.rollback()
		throw error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await UserOrganization.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}

exports.findAll = async (filter = {}, options = {}) => {
	try {
		if (options?.organizationAttributes?.length > 0) {
			options.include = [
				{
					model: Organization,
					attributes: options.organizationAttributes,
					as: 'organization',
					where: { tenant_code: filter.tenant_code },
				},
			]
			delete options.organizationAttributes
		}
		return await UserOrganization.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}

exports.update = async (filter, updates) => {
	const transaction = await sequelize.transaction()
	try {
		await UserOrganization.update(updates, {
			where: filter,
			transaction,
		})
		await transaction.commit()
		return { success: true }
	} catch (error) {
		await transaction.rollback()
		console.error(error)
		throw error
	}
}

exports.delete = async (filter, options = {}) => {
	try {
		await UserOrganization.destroy({
			where: filter,
			...options,
		})

		return { success: true }
	} catch (error) {
		console.error('Delete Error:', error)
		throw error
	}
}
