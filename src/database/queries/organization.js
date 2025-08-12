'use strict'
const { Organization, sequelize, OrganizationRegistrationCode } = require('@database/models/index')
const { Op } = require('sequelize')
const common = require('@constants/common')

exports.create = async (data) => {
	const t = await sequelize.transaction() // Start a transaction
	try {
		// Create the organization
		const createdOrg = await Organization.create(data, { transaction: t })
		let successfulCodes = []

		// Handle registration codes if provided
		if (data?.registration_codes) {
			const registrationCodes = Array.isArray(data?.registration_codes)
				? data.registration_codes
				: data.registration_codes.split(',') || []

			const registrationCodesBody = registrationCodes.map((registration_code) => {
				return {
					registration_code: registration_code.toLowerCase().trim(),
					organization_code: createdOrg.toJSON().code,
					status: common.ACTIVE_STATUS,
					tenant_code: createdOrg.toJSON().tenant_code,
					created_by: createdOrg.toJSON().created_by || null,
					deleted_at: null,
				}
			})

			const results = await OrganizationRegistrationCode.bulkCreate(registrationCodesBody, { transaction: t })

			// // Wait for all promises to settle
			// const results = await Promise.all(registrationCodePromises)

			successfulCodes = results.map((result) => result.registration_code) || []
		}

		// Commit the transaction
		await t.commit()
		// Return the created organization
		return successfulCodes.length > 0
			? { ...createdOrg.get({ plain: true }), registration_codes: successfulCodes }
			: createdOrg.get({ plain: true })
	} catch (error) {
		// Roll back the transaction on error
		await t.rollback()

		// Log and rethrow the error
		console.error(error)
		throw error
	}
}
exports.findOne = async (filter, options = {}) => {
	try {
		let includes = [...(options.include || [])]
		if (options?.isAdmin) {
			includes.push({
				model: OrganizationRegistrationCode,
				as: 'organizationRegistrationCodes',
				attributes: ['registration_code'],
				where: { status: 'ACTIVE', deleted_at: null, tenant_code: filter.tenant_code },
				required: false,
			})
		}

		if (options?.getRelatedOrgIdAndCode) {
			includes.push({
				model: Organization,
				as: 'relatedOrgsDetails',
				attributes: ['id', 'code'],
				required: false,
				on: sequelize.literal(`"relatedOrgsDetails"."id" = ANY("Organization"."related_orgs")`),
			})
		}
		delete options.isAdmin
		delete options?.getRelatedOrgIdAndCode
		let organization = await Organization.findOne({
			where: filter,
			...options,
			include: includes,
			nest: true,
		})
		if (!organization) return null

		// Convert Sequelize instance to plain object
		organization = organization.toJSON()

		if (organization && organization?.organizationRegistrationCodes) {
			const registrationCodes = organization.organizationRegistrationCodes
				? Array.isArray(organization.organizationRegistrationCodes)
					? organization.organizationRegistrationCodes.map((code) => code.registration_code).filter(Boolean)
					: [organization.organizationRegistrationCodes.registration_code].filter(Boolean)
				: []

			delete organization.organizationRegistrationCodes
			organization.registration_codes = registrationCodes
		}

		return organization
	} catch (error) {
		throw error
	}
}

exports.update = async (filter, update, options = {}) => {
	try {
		const result = await Organization.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
		const [rowsAffected, updatedRows] = result

		return options.returning ? { rowsAffected, updatedRows } : rowsAffected
	} catch (error) {
		console.log(error)

		throw error
	}
}

exports.appendRelatedOrg = async (relatedOrg, ids, options = {}) => {
	try {
		const result = await Organization.update(
			{
				related_orgs: sequelize.fn('array_append', sequelize.col('related_orgs'), relatedOrg),
			},
			{
				where: {
					id: ids,
					[Op.or]: [
						{
							[Op.not]: {
								related_orgs: {
									[Op.contains]: [relatedOrg],
								},
							},
						},
						{
							related_orgs: {
								[Op.is]: null,
							},
						},
					],
				},
				...options,
				individualHooks: true,
			}
		)

		const [rowsAffected, updatedRows] = result
		return options.returning ? { rowsAffected, updatedRows } : rowsAffected
	} catch (error) {
		console.log(error)
		throw error
	}
}

exports.removeRelatedOrg = async (removedOrgIds, ids, options = {}) => {
	try {
		const result = await Organization.update(
			{ related_orgs: sequelize.fn('array_remove', sequelize.col('related_orgs'), removedOrgIds) },
			{
				where: {
					id: ids,
				},
				...options,
				individualHooks: true,
			}
		)

		const [rowsAffected, updatedRows] = result
		return options.returning ? { rowsAffected, updatedRows } : rowsAffected
	} catch (error) {
		console.log(error)
		throw error
	}
}
exports.listOrganizations = async (page, limit, search) => {
	try {
		let filterQuery = {
			where: { status: common.ACTIVE_STATUS },
			attributes: ['id', 'name', 'code', 'description'],
			offset: parseInt((page - 1) * limit, 10),
			limit: parseInt(limit, 10),
			order: [['name', 'ASC']],
		}

		if (search) {
			filterQuery.where.name = {
				[Op.iLike]: search + '%',
			}
		}

		const result = await Organization.findAndCountAll(filterQuery)
		const transformedResult = {
			count: result.count,
			data: result.rows.map((row) => {
				return row.get({ plain: true })
			}),
		}
		return transformedResult
	} catch (error) {
		throw error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await Organization.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}

exports.findByPk = async (id) => {
	try {
		return await Organization.findByPk(id, { raw: true })
	} catch (error) {
		throw error
	}
}

exports.findOrgWithRegistrationCode = async (filter, options = {}) => {
	try {
		let organizationReg = await OrganizationRegistrationCode.findOne({
			where: filter,
			...options,
			include: [
				{
					model: Organization,
					as: 'organization',
					where: { status: 'ACTIVE', deleted_at: null, tenant_code: filter.tenant_code },
					required: true,
				},
			],
			nest: true,
		})
		const organization = organizationReg ? organizationReg.toJSON().organization : null
		return organization
	} catch (error) {
		throw error
	}
}

exports.hardDelete = async (id) => {
	try {
		await Organization.destroy({
			where: {
				id,
			},
			force: true,
		})
		return { success: true }
	} catch (error) {
		console.error(error)
		throw error
	}
}
