'use strict'
const OrganizationFeature = require('@database/models/index').OrganizationFeature
const FeatureRoleMapping = require('@database/models/index').FeatureRoleMapping
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		return await OrganizationFeature.create(data, { returning: true })
	} catch (error) {
		throw error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await OrganizationFeature.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.updateOrganizationFeature = async (filter, update, options = {}) => {
	try {
		const organizationFeature = await OrganizationFeature.update(update, {
			where: filter,
			...options,
			individualHooks: true,
			returning: true,
			raw: true,
		})

		return organizationFeature
	} catch (error) {
		return error
	}
}

exports.findAllOrganizationFeature = async (filter, options = {}) => {
	try {
		const organizationFeature = await OrganizationFeature.findAll({
			where: filter,
			...options,
			raw: true,
		})
		return organizationFeature
	} catch (error) {
		return error
	}
}

exports.findAllFeatureWithRoleMappings = async (filter, options = {}, roleTitles = []) => {
	try {
		const organizationFeature = await OrganizationFeature.findAll({
			where: filter,
			...options,
			include: [
				{
					model: FeatureRoleMapping,
					as: 'roleMappings',
					...(roleTitles?.length > 0 && {
						where: { role_title: { [Op.in]: roleTitles } },
					}),
					required: false,
				},
			],
			raw: false,
			nest: true,
		})
		return organizationFeature
	} catch (error) {
		return error
	}
}

exports.hardDelete = async (feature_code, organization_code, tenant_code) => {
	try {
		return await OrganizationFeature.destroy({
			where: {
				feature_code: feature_code,
				organization_code: organization_code,
				tenant_code: tenant_code,
			},
			force: true,
		})
	} catch (error) {
		throw error
	}
}

exports.delete = async (feature_code, organization_code, tenant_code) => {
	try {
		return await OrganizationFeature.destroy({
			where: {
				feature_code: feature_code,
				organization_code: organization_code,
				tenant_code: tenant_code,
			},
			individualHooks: true,
		})
	} catch (error) {
		throw error
	}
}
