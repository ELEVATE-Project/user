'use strict'
const database = require('@database/models/index')
const Organization = require('@database/models/index').Organization
const { Op, QueryTypes } = require('sequelize')
const Sequelize = require('@database/models/index').sequelize
const emailEncryption = require('@utils/emailEncryption')
const _ = require('lodash')

exports.getColumns = async () => {
	try {
		return await Object.keys(database.User.rawAttributes)
	} catch (error) {
		throw error
	}
}
exports.getModelName = async () => {
	try {
		return await database.User.name
	} catch (error) {
		throw error
	}
}

exports.create = async (data, transaction = null) => {
	try {
		return await database.User.create(data, { transaction })
	} catch (error) {
		console.log(error)
		throw error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await database.User.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}

exports.updateUser = async (filter, update, options = {}) => {
	try {
		return await database.User.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
	} catch (error) {
		throw error
	}
}

exports.findByPk = async (id) => {
	try {
		return await database.User.findByPk(id, { raw: true })
	} catch (error) {
		throw error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await database.User.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}

exports.listUsers = async (roleId, organization_id, page, limit, search) => {
	try {
		const offset = (page - 1) * limit
		const whereClause = {}

		if (search) {
			whereClause.name = { [Op.iLike]: search + '%' }
		}

		if (roleId) {
			whereClause.roles = { [Op.contains]: [roleId] }
		}

		if (organization_id) {
			whereClause.organization_id = organization_id
		}

		const filterQuery = {
			where: whereClause,
			attributes: ['id', 'name', 'about', 'image'],
			offset: parseInt(offset, 10),
			limit: parseInt(limit, 10),
			order: [['name', 'ASC']],
			include: [
				{
					model: Organization,
					required: false,
					where: {
						status: 'ACTIVE',
					},
					attributes: ['id', 'name', 'code'],
					as: 'organization',
				},
			],
			raw: true,
			nest: true,
		}

		const { count, rows: users } = await database.User.findAndCountAll(filterQuery)

		return { count, data: users }
	} catch (error) {
		throw error
	}
}

exports.findAllUserWithOrganization = async (filter, options = {}) => {
	try {
		return await database.User.findAll({
			where: filter,
			...options,
			include: [
				{
					model: Organization,
					required: false,
					where: {
						status: 'ACTIVE',
					},
					attributes: ['id', 'name', 'code'],
					as: 'organization',
				},
			],
			raw: true,
			nest: true,
		})
	} catch (error) {
		throw error
	}
}

exports.findUserWithOrganization = async (filter, options = {}) => {
	try {
		return await database.User.findOne({
			where: filter,
			...options,
			include: [
				{
					model: Organization,
					required: false,
					where: {
						status: 'ACTIVE',
					},
					attributes: ['id', 'name', 'code'],
					as: 'organization',
				},
			],
			raw: true,
			nest: true,
		})
	} catch (error) {
		throw error
	}
}
exports.listUsersFromView = async (
	roleId,
	organization_id,
	page,
	limit,
	search,
	userIds,
	emailIds,
	excluded_user_ids
) => {
	try {
		const offset = (page - 1) * limit

		const filterConditions = []

		if (emailIds) {
			filterConditions.push(`users.email IN ('${emailIds.join("','")}')`)
		} else if (search) {
			filterConditions.push(`users.name ILIKE :search`)
		}

		if (!Array.isArray(roleId)) {
			filterConditions.push(`users.roles @> ARRAY[:roleId]::integer[]`)
		} else {
			// If roleId is an array, use the '&&' operator to check if there is an overlap between roleId and users.roles arrays
			filterConditions.push(`ARRAY[:roleId] && users.roles`)
		}

		if (organization_id) {
			filterConditions.push(`users.organization_id = :organization_id`)
		}
		if (userIds) {
			if (excluded_user_ids) {
				userIds = _.difference(userIds, excluded_user_ids)
			}
			filterConditions.push(`users.id IN (:userIds)`)
		} else if (excluded_user_ids && excluded_user_ids.length > 0) {
			filterConditions.push(`users.id NOT IN (:excluded_user_ids)`)
		}

		const filterClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : ''

		const filterQuery = `
            SELECT
                users.id,
                users.name,
				users.email,
                users.about,
                users.image,
                jsonb_build_object(
                    'id', organization.id,
                    'name', organization.name,
                    'code', organization.code
                ) AS organization
            FROM
                m_${database.User.tableName} AS users
            LEFT JOIN
                ${Organization.tableName} AS organization
            ON
                users.organization_id = organization.id
                AND organization.status = 'ACTIVE'
            ${filterClause}
            ORDER BY
				LOWER(users.name) ASC
			OFFSET
                :offset
            LIMIT
                :limit;
        `

		const replacements = {
			search: `%${search}%`,
			roleId: roleId,
			organization_id: organization_id,
			offset: parseInt(offset, 10),
			limit: parseInt(limit, 10),
			userIds: userIds,
			excluded_user_ids: excluded_user_ids,
		}

		let users = await Sequelize.query(filterQuery, {
			type: QueryTypes.SELECT,
			replacements: replacements,
		})

		users = users.filter((user) => {
			user.email = emailEncryption.decrypt(user.email)
			return user
		})
		const countQuery = ` SELECT COUNT(*) as total_count
    				FROM m_${database.User.tableName} AS users
    				LEFT JOIN ${Organization.tableName} AS organization
        			ON users.organization_id = organization.id
        			AND organization.status = 'ACTIVE'
    				${filterClause};
				`
		const totalCountData = await Sequelize.query(countQuery, {
			type: QueryTypes.SELECT,
			replacements: replacements,
		})
		const totalCount = totalCountData.length > 0 ? Number(totalCountData[0].total_count) : 0

		return { count: totalCount, data: users }
	} catch (error) {
		throw error
	}
}

exports.changeOrganization = async (id, currentOrgId, newOrgId, updateBody = {}) => {
	const transaction = await Sequelize.transaction()
	try {
		const existingUserRow = await database.User.findOne({
			where: { id, organization_id: currentOrgId },
			raw: true,
			transaction,
		})

		if (!existingUserRow) throw new Error('User not found')

		await database.User.destroy({
			where: { id, organization_id: currentOrgId },
			force: true,
			transaction,
		})

		const newUserRow = await database.User.create(
			{
				...existingUserRow,
				...updateBody,
				organization_id: newOrgId,
				id,
			},
			{ transaction }
		)

		await transaction.commit()
		return newUserRow
	} catch (error) {
		await transaction.rollback()
		throw error
	}
}
