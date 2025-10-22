'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			// Step 1: Get all unique organization_ids per tenant from existing user_roles
			const [orgsByTenant] = await queryInterface.sequelize.query(
				`SELECT DISTINCT tenant_code, organization_id 
         FROM user_roles 
         WHERE deleted_at IS NULL 
         AND tenant_code IN (
           SELECT code FROM tenants WHERE deleted_at IS NULL
         )
         ORDER BY tenant_code, organization_id`,
				{ transaction }
			)

			if (orgsByTenant.length === 0) {
				console.log('No active organizations found. Skipping migration.')
				await transaction.commit()
				return
			}

			console.log(`Found ${orgsByTenant.length} organization-tenant combinations`)

			// Step 2: Insert tenant_admin role for each tenant-organization combination
			const userRoleInserts = orgsByTenant.map((org) => ({
				title: 'tenant_admin',
				label: 'Tenant Admin',
				user_type: 1, // Adjust this value based on your user_type convention
				status: 'ACTIVE',
				organization_id: org.organization_id,
				visibility: 'PUBLIC',
				tenant_code: org.tenant_code,
				translations: null,
				created_at: new Date(),
				updated_at: new Date(),
			}))

			await queryInterface.bulkInsert('user_roles', userRoleInserts, {
				transaction,
				ignoreDuplicates: true, // In case role already exists
			})

			console.log(`Inserted tenant_admin role for ${userRoleInserts.length} organization-tenant combinations`)

			// Step 3: Get all admin permissions except admin module and admin-only permissions
			// Excluding:
			// - module = 'admin' (permission_ids: 22, 23, 26)
			// - Admin-only feature permission (40)
			// - Admin-only tenant permission (35)
			// Including organization permissions (8, 28, 29, 30) as per requirement
			const [adminPermissions] = await queryInterface.sequelize.query(
				`SELECT DISTINCT 
          permission_id,
          module,
          request_type,
          api_path,
          created_at,
          updated_at,
          created_by
        FROM role_permission_mapping
        WHERE role_title = 'admin'
          AND module != 'admin'
          AND permission_id NOT IN (35, 40)
        ORDER BY permission_id`,
				{ transaction }
			)

			console.log(`Found ${adminPermissions.length} permissions to copy for tenant_admin`)

			// Step 4: Insert permissions for tenant_admin role
			if (adminPermissions.length > 0) {
				const permissionInserts = adminPermissions.map((perm) => ({
					role_title: 'tenant_admin',
					permission_id: perm.permission_id,
					module: perm.module,
					request_type: perm.request_type,
					api_path: perm.api_path,
					created_at: new Date(),
					updated_at: new Date(),
					created_by: perm.created_by,
				}))

				await queryInterface.bulkInsert('role_permission_mapping', permissionInserts, {
					transaction,
					ignoreDuplicates: true,
				})

				console.log(`Inserted ${permissionInserts.length} permissions for tenant_admin role`)
			}

			// Commit transaction
			await transaction.commit()
			console.log('Migration completed successfully')
			console.log('Summary:')
			console.log(`- Created tenant_admin roles: ${userRoleInserts.length}`)
			console.log(`- Assigned permissions: ${adminPermissions.length}`)
			console.log('- Excluded modules: admin')
			console.log('- Excluded permissions: 35 (tenant), 40 (feature full CRUD)')
		} catch (error) {
			// Rollback transaction on error
			await transaction.rollback()
			console.error('Migration failed, rolled back:', error)
			throw error
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			// Step 1: Delete all tenant_admin permissions from role_permission_mapping
			const [deletePermResult] = await queryInterface.sequelize.query(
				`DELETE FROM role_permission_mapping WHERE role_title = 'tenant_admin'`,
				{ transaction }
			)

			console.log('Deleted all tenant_admin permissions')

			// Step 2: Delete all tenant_admin roles from user_roles (soft delete if paranoid)
			const [deleteRoleResult] = await queryInterface.sequelize.query(
				`DELETE FROM user_roles WHERE title = 'tenant_admin'`,
				{ transaction }
			)

			console.log('Deleted all tenant_admin roles')

			await transaction.commit()
			console.log('Rollback completed successfully')
		} catch (error) {
			await transaction.rollback()
			console.error('Rollback failed:', error)
			throw error
		}
	},
}
