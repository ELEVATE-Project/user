'use strict'
const { OrganizationRegistrationCode, sequelize } = require('@database/models/index')
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		const createdOrgRegCode = await OrganizationRegistrationCode.create(data)
		return createdOrgRegCode.get({ plain: true })
	} catch (error) {
		console.error(error)
		throw error
	}
}
exports.bulkCreate = async (dataArray) => {
	try {
		const transaction = await sequelize.transaction()
		try {
			// Perform bulkCreate within the transaction
			const createdOrgRegCodes = await OrganizationRegistrationCode.bulkCreate(dataArray, {
				individualHooks: true,
				transaction, // Pass the transaction object
			})

			// Commit the transaction if successful
			await transaction.commit()
			return createdOrgRegCodes.map((code) => code.get({ plain: true }))
		} catch (error) {
			// Rollback the transaction on error
			await transaction.rollback()
			throw error // Re-throw the error for further handling
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
exports.findOne = async (filter, options = {}) => {
	try {
		return await OrganizationRegistrationCode.findOne({
			where: filter,
			attributes: options.attributes || undefined,
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
		return await OrganizationRegistrationCode.findAll({
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
	try {
		return await OrganizationRegistrationCode.update(updates, {
			where: filter,
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}

exports.delete = async (registrationCode, organizationCode, tenantCode) => {
	try {
		return await OrganizationRegistrationCode.destroy({
			where: {
				registration_code: registrationCode,
				organization_code: organizationCode,
				tenant_code: tenantCode,
			},
		})
	} catch (error) {
		throw error
	}
}
exports.bulkDelete = async (registrationCodes, organizationCode, tenantCode) => {
	try {
		return await OrganizationRegistrationCode.destroy({
			where: {
				registration_code: {
					[Op.in]: registrationCodes,
				},
				organization_code: organizationCode,
				tenant_code: tenantCode,
			},
		})
	} catch (error) {
		throw error
	}
}
