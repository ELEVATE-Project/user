'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			const defaultOrgCode = process.env.DEFAULT_ORGANISATION_CODE

			const defaultOrgsPerTenant = await queryInterface.sequelize.query(
				'SELECT id, code, tenant_code FROM organizations WHERE code = :defaultOrgCode',
				{
					replacements: { defaultOrgCode },
					type: queryInterface.sequelize.QueryTypes.SELECT,
					transaction,
				}
			)

			if (!defaultOrgsPerTenant.length) {
				console.warn('No default organizations found across tenants. Skipping migration.')
				await transaction.commit()
				return
			}

			const now = new Date()
			const entityTypesToInsert = defaultOrgsPerTenant.map((org) => ({
				value: 'name',
				label: 'Name',
				status: 'ACTIVE',
				created_by: null,
				updated_by: null,
				allow_filtering: false,
				data_type: 'STRING',
				organization_id: org.id,
				organization_code: org.code,
				tenant_code: org.tenant_code,
				parent_id: null,
				has_entities: false,
				allow_custom_entities: false,
				model_names: ['User'],
				created_at: now,
				updated_at: now,
			}))

			await queryInterface.bulkInsert('entity_types', entityTypesToInsert, { transaction })

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			console.error('Migration up failed:', error)
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			await queryInterface.bulkDelete(
				'entity_types',
				{
					value: 'name',
				},
				{ transaction }
			)
			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			console.error('Migration down failed:', error)
			throw error
		}
	},
}
