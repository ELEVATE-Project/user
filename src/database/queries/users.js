'use strict'
const database = require('@database/models/index')
const Organization = require('@database/models/index').Organization
const { Op, QueryTypes } = require('sequelize')
const Sequelize = require('@database/models/index').sequelize
const emailEncryption = require('@utils/emailEncryption')
const _ = require('lodash')
const UserTransformDTO = require('@dtos/userDTO') // Path to your DTO file

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

exports.create = async (data, options = {}) => {
	try {
		return await database.User.create(data, options)
	} catch (error) {
		console.error(error)
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

exports.listUsers = async (roleId, organization_id, page, limit, search, tenant_code, raw = false) => {
	try {
		const offset = (page - 1) * limit

		// Build the search clause for user name
		const userWhereClause = {}
		if (search) {
			userWhereClause.name = { [Op.iLike]: search + '%' }
		}

		// Include filters within the nested include
		const userOrgWhereClause = {}
		const userOrgRoleWhereClause = {}

		if (organization_id) {
			userOrgWhereClause.organization_id = organization_id
		}
		if (roleId) {
			userOrgRoleWhereClause.role_id = roleId
		}

		// Final query using the updated schema
		let { count, rows: users } = await database.User.findAndCountAll({
			where: userWhereClause,
			attributes: ['id', 'name', 'about', 'image'],
			offset: parseInt(offset, 10),
			limit: parseInt(limit, 10),
			order: [['name', 'ASC']],
			include: [
				{
					model: database.UserOrganization,
					as: 'user_organizations',
					required: true,
					where: {
						...userOrgWhereClause,
						tenant_code,
					},
					include: [
						{
							model: database.Organization,
							as: 'organization',
							where: {
								status: 'ACTIVE',
								tenant_code,
							},
							attributes: ['id', 'name', 'code'],
							required: false,
						},
						{
							model: database.UserOrganizationRole,
							as: 'roles',
							where: {
								...userOrgRoleWhereClause,
								tenant_code,
							},
							attributes: ['role_id'],
							include: [
								{
									model: database.UserRole,
									as: 'role',
									where: {
										tenant_code,
									},
									attributes: ['id', 'title', 'label'],
									required: false,
								},
							],
						},
					],
				},
			],
			raw: false,
			nested: false,
		})

		if (!raw) {
			users = UserTransformDTO.transform(users)
		}
		return { count, data: users }
	} catch (error) {
		console.error('Error in listUsers:', error)
		throw error
	}
}

exports.findAllUserWithOrganization = async (filter, options = {}, tenantCode, raw = false) => {
	try {
		let users = await database.User.findAll({
			where: filter,
			...options,
			include: [
				{
					model: database.UserOrganization,
					as: 'user_organizations',
					required: true,
					where: {
						tenant_code: tenantCode,
					},
					include: [
						{
							model: database.Organization,
							as: 'organization',
							where: {
								status: 'ACTIVE',
								tenant_code: tenantCode,
							},
							attributes: ['id', 'name', 'code'],
							required: false,
						},
						{
							model: database.UserOrganizationRole,
							as: 'roles',
							where: {
								tenant_code: tenantCode,
							},
							attributes: ['role_id'],
							include: [
								{
									model: database.UserRole,
									as: 'role',
									where: {
										tenant_code: tenantCode,
									},
									attributes: ['id', 'title', 'label'],
									required: false,
								},
							],
						},
					],
				},
			],
			raw: false,
			nested: false,
		})

		if (!raw) {
			users = UserTransformDTO.transform(users)
		}
		return users
	} catch (error) {
		console.error('Error in findAllUserWithOrganization:', error)
		throw error
	}
}

exports.findUserWithOrganization = async (filter, options = {}, raw = false) => {
	try {
		let user = await database.User.findOne({
			where: filter, // e.g., { id: 19, tenant_code: 'default' }
			...options,
			include: [
				{
					model: database.UserOrganization,
					as: 'user_organizations',
					required: false,
					//attributes: ['organization_code', 'tenant_code'],
					where: {
						tenant_code: filter.tenant_code,
					},
					include: [
						{
							model: database.Organization,
							as: 'organization',
							where: {
								status: 'ACTIVE',
								tenant_code: filter.tenant_code,
							},
							//attributes: ['id', 'name', 'code'],
							required: false,
						},
						{
							model: database.UserOrganizationRole,
							as: 'roles',
							attributes: ['role_id'],
							where: {
								tenant_code: filter.tenant_code,
							},
							include: [
								{
									model: database.UserRole,
									as: 'role',
									//attributes: ['id', 'title', 'label'],
									where: {
										tenant_code: filter.tenant_code, // manually enforce composite FK
									},
									required: false,
								},
							],
						},
					],
				},
			],
		})
		if (!user) return null
		if (!raw) {
			user = user ? user.toJSON() : null
			user = UserTransformDTO.transform(user) // Transform the data
		}

		return user
	} catch (error) {
		console.error('Error in findUserWithOrganization:', error)
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
exports.searchUsersWithOrganization = async ({
	roleIds,
	organization_id,
	page,
	limit,
	search,
	userIds,
	emailIds,
	excluded_user_ids,
	tenantCode,
}) => {
	try {
		const offset = (page - 1) * limit

		// Base filter for user
		const userWhere = {}

		// Filter by userIds / exclude
		if (userIds && Array.isArray(userIds)) {
			userWhere.id = { [Op.in]: userIds }
			if (excluded_user_ids && excluded_user_ids.length > 0) {
				userWhere.id = {
					[Op.and]: [{ [Op.in]: userIds }, { [Op.notIn]: excluded_user_ids }],
				}
			}
		} else if (excluded_user_ids && excluded_user_ids.length > 0) {
			userWhere.id = { [Op.notIn]: excluded_user_ids }
		}

		// Filter by search text or email
		if (emailIds && emailIds.length > 0) {
			userWhere.email = { [Op.in]: emailIds }
		} else if (search) {
			userWhere.name = { [Op.iLike]: `%${search}%` }
		}

		const users = await database.User.findAndCountAll({
			where: userWhere,
			limit: limit,
			offset: offset,
			order: [['name', 'ASC']],
			include: [
				{
					model: database.UserOrganization,
					as: 'user_organizations',
					required: true,
					where: {
						tenant_code: tenantCode,
						...(organization_id && { organization_id }),
					},
					include: [
						{
							model: database.Organization,
							as: 'organization',
							required: false,
							where: {
								status: 'ACTIVE',
								tenant_code: tenantCode,
							},
							attributes: ['id', 'name', 'code'],
						},
						{
							model: database.UserOrganizationRole,
							as: 'roles',
							required: roleIds && roleIds.length > 0,
							where: {
								tenant_code: tenantCode,
								...(roleIds && roleIds.length > 0 && { role_id: { [Op.in]: roleIds } }),
							},
							attributes: ['role_id'],
							include: [
								{
									model: database.UserRole,
									as: 'role',
									required: false,
									where: { tenant_code: tenantCode },
									attributes: ['id', 'title', 'label'],
								},
							],
						},
					],
				},
			],
			raw: false,
			distinct: true, // Needed for correct count when using include
		})

		return {
			count: users.count,
			data: users.rows,
		}
	} catch (error) {
		console.error('Error in searchUsersWithOrganization:', error)
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

/**
 * Deactivates users within a specific organization and tenant based on the provided filter.
 *
 * This function:
 * - First fetches all users matching the `filter` and ensures they belong to the given `organization_code` and `tenant_code`.
 * - Updates the matched users' records with the given `updateData`.
 * - Optionally returns the list of matched user records if `returnUpdatedUsers` is set to true.
 *
 * Note:
 * - Users not associated with the given organization/tenant are excluded.
 * - This function currently assumes each user belongs to only one organization in this context.
 *
 * @async
 * @param {Object} filter - Sequelize-compatible filter criteria for selecting users.
 * @param {string} organization_code - Code of the organization to scope user lookup.
 * @param {string} tenant_code - Tenant code for further scoping the user lookup.
 * @param {Object} updateData - Fields to update for the matched users (e.g., status, updated_by).
 * @param {boolean} [returnUpdatedUsers=false] - Whether to return the list of matched user records.
 *
 * @returns {Promise<[number, Object[]]>} A tuple:
 *  - First item: Number of rows affected by the update.
 *  - Second item: Array of user records if `returnUpdatedUsers` is true, otherwise an empty array.
 *
 * @throws {Error} Throws if there is any issue during the query or update.
 */

exports.deactivateUserInOrg = async (filter, organizationCode, tenantCode, updateData, returnUpdatedUsers = false) => {
	try {
		const users = await database.User.findAll({
			where: filter,
			include: [
				{
					model: database.UserOrganization,
					as: 'user_organizations',
					required: true,
					where: {
						organization_code: organizationCode,
						tenant_code: tenantCode,
					},
					attributes: [],
				},
			],
			attributes: ['id'],
		})

		const userIds = users.map((u) => u.id)

		if (userIds.length === 0) return [0, []]

		const [rowsAffected] = await database.User.update(updateData, {
			where: { id: { [Op.in]: userIds, tenant_code: tenantCode } },
		})

		return [rowsAffected, returnUpdatedUsers ? users : []]
	} catch (error) {
		console.error('Error in deactivateUserInOrg:', error)
		throw error
	}
}
