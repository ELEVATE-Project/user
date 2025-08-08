const common = require('@constants/common')
const utils = require('@generics/utils')
const userQueries = require('@database/queries/users')
const userOrganizationQueries = require('@database/queries/userOrganization')
const userOrganizationRoleQueries = require('@database/queries/userOrganizationRole')
const userSessionsService = require('@services/user-sessions')
const Sequelize = require('@database/models/index').sequelize
const REDIS_USER_PREFIX = common.redisUserPrefix
const DELETED_STATUS = common.DELETED_STATUS
const userSessionsQueries = require('@database/queries/user-sessions')

function generateUpdateParams(userId) {
	return {
		deleted_at: new Date(),
		name: 'Anonymous User',
		email: `${utils.md5Hash(userId)}@deletedUser`, // Changed to SHA-256
		refresh_tokens: [],
		preferred_language: 'en',
		location: null,
		languages: [],
		roles: [],
		status: DELETED_STATUS,
		password: '',
		username: null,
		phone: null,
		phone_code: null,
		image: null,
		meta: null,
		about: null,
		share_link: null,
		custom_entity_text: null,
	}
}

async function executeInTransaction(userId, user, operations, transactionOptions = {}) {
	const transaction = await Sequelize.transaction({
		...transactionOptions,
	})
	try {
		await operations(transaction)
		await transaction.commit()
		return { success: true, message: 'USER_DELETED_SUCCESSFULLY' }
	} catch (error) {
		await transaction.rollback()
		console.error(`Failed to delete user ${userId}: ${error.message}`)
		throw new Error(`Failed to delete user ${userId}: ${error.message}`)
	}
}

const userHelper = {
	/**
	 * Deletes a user and their associated data.
	 * @param {number} userId - The ID of the user to delete.
	 * @param {Object} user - User object containing id and tenant_code.
	 * @param {Object} [transactionOptions={}] - Sequelize transaction options.
	 * @returns {Promise<{ success: boolean, message: string }>} - Result of the deletion.
	 * @throws {Error} If userId, user.id, or tenant_code is missing or if deletion fails.
	 */
	async deleteUser(userId, user, transactionOptions = {}) {
		if (!userId || !user?.id || !user?.tenant_code) {
			throw new Error('Invalid input: userId, user.id, or tenant_code is missing')
		}

		return executeInTransaction(
			userId,
			user,
			async (transaction) => {
				const { id, tenant_code, ...rest } = user
				const update = { ...rest, ...generateUpdateParams(userId) }

				await userQueries.updateUser({ id: user.id }, update, { transaction })
				await userOrganizationQueries.delete(
					{ user_id: user.id, tenant_code: user.tenant_code },
					{ transaction }
				)
				await userOrganizationRoleQueries.delete(
					{ user_id: user.id, tenant_code: user.tenant_code },
					{ transaction }
				)
				await utils.redisDel([`${REDIS_USER_PREFIX}${user.tenant_code}_${userId}`])

				const userSessionData = await userSessionsService.findUserSession(
					{
						user_id: userId,
						ended_at: null,
					},
					{
						attributes: ['id'],
					},
					{ transaction }
				)
				const userSessionIds = userSessionData.map(({ id }) => id)
				await userSessionsService.removeUserSessions(userSessionIds)
			},
			transactionOptions
		)
	},

	/**
	 * Removes all active sessions for the specified user(s) within a tenant.
	 *
	 * This function performs the following:
	 * - Accepts one or more user IDs and ensures they belong to the given tenant.
	 * - Retrieves all active sessions (where `ended_at` is null).
	 * - Deletes associated session keys from Redis.
	 * - Marks the sessions as ended in the database by setting `ended_at` to the current timestamp.
	 *
	 * @async
	 * @param {number|number[]} userIds - A single user ID or an array of user IDs whose sessions should be removed.
	 * @param {string} tenantCode - The tenant code used to scope session lookup.
	 *
	 * @returns {Promise<{ success: boolean, removedCount: number }>} Object indicating success status and number of sessions removed.
	 *
	 * @throws {Error} If any step in the removal process fails (Redis or DB update).
	 */

	async removeAllUserSessions(userIds, tenantCode) {
		try {
			const userIdArray = Array.isArray(userIds) ? userIds : [userIds]

			if (userIdArray.length === 0) {
				return { success: true, removedCount: 0 }
			}

			// Find all active sessions for the user(s)
			const sessions = await userSessionsQueries.findAll(
				{
					user_id: userIdArray,
					tenant_code: tenantCode,
					ended_at: null,
				},
				{ attributes: ['id'] }
			)

			const sessionIds = sessions.map((s) => s.id)

			if (sessionIds.length === 0) {
				return { success: true, removedCount: 0 }
			}

			// Delete from Redis
			await Promise.all(sessionIds.map((id) => utils.redisDel(id.toString())))

			// Mark sessions as ended in DB
			const currentTime = Math.floor(Date.now() / 1000)
			const updateResult = await userSessionsQueries.update({ id: sessionIds }, { ended_at: currentTime })

			if (updateResult instanceof Error) {
				throw updateResult
			}

			return { success: true, removedCount: sessionIds.length }
		} catch (error) {
			throw new Error(`Failed to remove sessions: ${error.message}`)
		}
	},
}

module.exports = userHelper
