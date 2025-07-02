module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.sequelize.transaction(async (transaction) => {
				console.log('Starting migration: Adding foreign key constraints and indexes...')

				// Helper function to safely add constraint
				const addConstraintSafely = async (table, constraint) => {
					try {
						await queryInterface.addConstraint(table, { ...constraint, transaction })
						console.log(`✓ Added constraint ${constraint.name} to ${table}`)
					} catch (error) {
						console.error(`✗ Failed to add constraint ${constraint.name} to ${table}:`, error.message)
						throw error
					}
				}

				// Helper function to safely add index
				const addIndexSafely = async (table, fields, options = {}) => {
					try {
						await queryInterface.addIndex(table, fields, { ...options, transaction })
						console.log(`✓ Added index on ${table}(${fields.join(', ')})`)
					} catch (error) {
						console.error(`✗ Failed to add index on ${table}(${fields.join(', ')}):`, error.message)
						throw error
					}
				}

				// 1. entities table relations
				console.log('Adding constraints for entities table...')
				await addConstraintSafely('entities', {
					fields: ['entity_type_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_entities_entity_type',
					references: {
						table: 'entity_types',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('entities', {
					fields: ['created_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_entities_created_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('entities', {
					fields: ['updated_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_entities_updated_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})
				// 2. entity_types table relations
				console.log('Adding constraints for entity_types table...')
				await addConstraintSafely('entity_types', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_entity_types_organization',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('entity_types', {
					fields: ['parent_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_entity_types_parent',
					references: {
						table: 'entity_types',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('entity_types', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_entity_types_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('entity_types', {
					fields: ['created_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_entity_types_created_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('entity_types', {
					fields: ['updated_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_entity_types_updated_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				// 3. features table relations
				console.log('Adding constraints for features table...')
				/* 		await addConstraintSafely('features', {
			fields: ['created_by'],
			type: 'foreign key',
			name: 'fk_features_created_by',
			references: {
				table: 'users',
				fields: ['id'], 
			},
			onUpdate: 'NO ACTION',
			onDelete: 'NO ACTION',
		})

		await addConstraintSafely('features', {
			fields: ['updated_by'],
			type: 'foreign key',
			name: 'fk_features_updated_by',
			references: {
				table: 'users',
				fields: ['id'], 
			},
			onUpdate: 'NO ACTION',
			onDelete: 'NO ACTION',
		}) */

				// 4. file_uploads table relations
				console.log('Adding constraints for file_uploads table...')
				await addConstraintSafely('file_uploads', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_file_uploads_organization',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('file_uploads', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_file_uploads_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('file_uploads', {
					fields: ['created_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_file_uploads_created_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('file_uploads', {
					fields: ['updated_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_file_uploads_updated_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				// 5. forms table relations
				console.log('Adding constraints for forms table...')
				await addConstraintSafely('forms', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_forms_organization',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('forms', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_forms_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 6. invitations table relations (already has file_id FK)
				console.log('Adding constraints for invitations table...')
				await addConstraintSafely('invitations', {
					fields: ['created_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_invitations_created_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('invitations', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_invitations_organization',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('invitations', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_invitations_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 7. notification_templates table relations
				console.log('Adding constraints for notification_templates table...')
				await addConstraintSafely('notification_templates', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_notification_templates_organization',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('notification_templates', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_notification_templates_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 8. organization_email_domains table relations
				console.log('Adding constraints for organization_email_domains table...')
				await addConstraintSafely('organization_email_domains', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_email_domains_organization_id',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_email_domains', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_org_email_domains_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_email_domains', {
					fields: ['created_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_email_domains_created_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organization_email_domains', {
					fields: ['updated_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_email_domains_updated_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				// 9. organization_features table relations (already has feature_code FK)
				console.log('Adding constraints for organization_features table...')
				await addConstraintSafely('organization_features', {
					fields: ['organization_code', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_features_organization',
					references: {
						table: 'organizations',
						fields: ['code', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_features', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_org_features_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_features', {
					fields: ['created_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_features_created_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organization_features', {
					fields: ['updated_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_features_updated_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organization_features', {
					fields: ['feature_code'],
					type: 'foreign key',
					name: 'fk_org_features_features',
					references: {
						table: 'features',
						field: 'code',
					},
					onDelete: 'NO ACTION', // Adjust based on your requirements (e.g., CASCADE, RESTRICT)
					onUpdate: 'NO ACTION', // Adjust based on your requirements
				})

				// 10. organization_role_requests table relations
				console.log('Adding constraints for organization_role_requests table...')
				await addConstraintSafely('organization_role_requests', {
					fields: ['requester_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_role_requests_requester',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_role_requests', {
					fields: ['role', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_role_requests_role',
					references: {
						table: 'user_roles',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_role_requests', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_role_requests_organization',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_role_requests', {
					fields: ['handled_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_role_requests_handled_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organization_role_requests', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_org_role_requests_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 11. organization_user_invites table relations (already has invitation_id FK)
				console.log('Adding constraints for organization_user_invites table...')
				await addConstraintSafely('organization_user_invites', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_user_invites_organization_id',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_user_invites', {
					fields: ['file_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_user_invites_file',
					references: {
						table: 'file_uploads',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organization_user_invites', {
					fields: ['created_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_user_invites_created_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organization_user_invites', {
					fields: ['organization_code', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_org_user_invites_org_code',
					references: {
						table: 'organizations',
						fields: ['code', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('organization_user_invites', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_org_user_invites_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 12. organizations table relations
				console.log('Adding constraints for organizations table...')
				await addConstraintSafely('organizations', {
					fields: ['parent_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_organizations_parent',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organizations', {
					fields: ['created_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_organizations_created_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organizations', {
					fields: ['updated_by', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_organizations_updated_by',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('organizations', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_organizations_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 13. role_permission_mapping table relations
				console.log('Adding constraints for role_permission_mapping table...')
				await addConstraintSafely('role_permission_mapping', {
					fields: ['permission_id'],
					type: 'foreign key',
					name: 'fk_role_permission_mapping_permission',
					references: {
						table: 'permissions',
						fields: ['id'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				/* 			await addConstraintSafely('role_permission_mapping', {
				fields: ['created_by', 'tenant_code'],
				type: 'foreign key',
				name: 'fk_role_permission_mapping_created_by',
				references: {
					table: 'users',
					fields: ['id', 'tenant_code'],
				},
				onUpdate: 'NO ACTION',
				onDelete: 'CASCADE',
			}) */

				// 14. user_roles table relations
				console.log('Adding constraints for user_roles table...')
				await addConstraintSafely('user_roles', {
					fields: ['organization_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_user_roles_organization',
					references: {
						table: 'organizations',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				await addConstraintSafely('user_roles', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_user_roles_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 15. user_sessions table relations
				console.log('Adding constraints for user_sessions table...')
				await addConstraintSafely('user_sessions', {
					fields: ['user_id', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_user_sessions_user',
					references: {
						table: 'users',
						fields: ['id', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 16. users table relations
				console.log('Adding constraints for users table...')
				await addConstraintSafely('users', {
					fields: ['tenant_code'],
					type: 'foreign key',
					name: 'fk_users_tenant',
					references: {
						table: 'tenants',
						fields: ['code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
				})

				// 17. tenants table relations
				console.log('Adding constraints for tenants table...')
				/* 				await addConstraintSafely('tenants', {
					fields: ['created_by', 'code'],
					type: 'foreign key',
					name: 'fk_tenants_created_by',
					references: {
						table: 'users',
						fields: ['id','tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				})

				await addConstraintSafely('tenants', {
					fields: ['updated_by', 'code'],
					type: 'foreign key',
					name: 'fk_tenants_updated_by',
					references: {
						table: 'users',
						fields: ['id',],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'NO ACTION',
				}) */

				// Add indexes for better performance
				console.log('Adding performance indexes...')
				await addIndexSafely('entities', ['entity_type_id'])
				await addIndexSafely('entity_types', ['organization_id', 'tenant_code'])
				await addIndexSafely('entity_types', ['parent_id', 'tenant_code'])
				await addIndexSafely('file_uploads', ['organization_id', 'tenant_code'])
				await addIndexSafely('forms', ['organization_id', 'tenant_code'])
				await addIndexSafely('invitations', ['created_by'])
				await addIndexSafely('invitations', ['organization_id', 'tenant_code'])
				await addIndexSafely('notification_templates', ['organization_id', 'tenant_code'])
				await addIndexSafely('organization_email_domains', ['organization_id'])
				await addIndexSafely('organization_features', ['organization_code', 'tenant_code'])
				await addIndexSafely('organization_role_requests', ['requester_id'])
				await addIndexSafely('organization_role_requests', ['organization_id', 'tenant_code'])
				await addIndexSafely('organization_user_invites', ['organization_id'])
				await addIndexSafely('organizations', ['parent_id', 'tenant_code'])
				await addIndexSafely('user_roles', ['organization_id', 'tenant_code'])
				await addIndexSafely('user_sessions', ['user_id'])

				console.log('Migration completed successfully!')
			})
		} catch (error) {
			console.error('❌ Migration failed:', error)
			throw error
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			console.log('Starting rollback: Removing foreign key constraints and indexes...')

			// Define the items to remove in proper order (indexes first, then constraints)
			const itemsToRemove = [
				// Remove indexes first
				{ type: 'index', table: 'user_sessions', name: 'user_sessions_user_id' },
				{ type: 'index', table: 'user_roles', name: 'user_roles_organization_id_tenant_code' },
				{ type: 'index', table: 'organizations', name: 'organizations_parent_id_tenant_code' },
				{
					type: 'index',
					table: 'organization_user_invites',
					name: 'organization_user_invites_organization_id',
				},
				{
					type: 'index',
					table: 'organization_role_requests',
					name: 'organization_role_requests_organization_id_tenant_code',
				},
				{ type: 'index', table: 'organization_role_requests', name: 'organization_role_requests_requester_id' },
				{
					type: 'index',
					table: 'organization_features',
					name: 'organization_features_organization_code_tenant_code',
				},
				{
					type: 'index',
					table: 'organization_email_domains',
					name: 'organization_email_domains_organization_id',
				},
				{
					type: 'index',
					table: 'notification_templates',
					name: 'notification_templates_organization_id_tenant_code',
				},
				{ type: 'index', table: 'invitations', name: 'invitations_organization_id_tenant_code' },
				{ type: 'index', table: 'invitations', name: 'invitations_created_by' },
				{ type: 'index', table: 'forms', name: 'forms_organization_id_tenant_code' },
				{ type: 'index', table: 'file_uploads', name: 'file_uploads_organization_id_tenant_code' },
				{ type: 'index', table: 'entity_types', name: 'entity_types_parent_id_tenant_code' },
				{ type: 'index', table: 'entity_types', name: 'entity_types_organization_id_tenant_code' },
				{ type: 'index', table: 'entities', name: 'entities_entity_type_id' },

				// Remove constraints (in reverse dependency order)
				{ type: 'constraint', name: 'fk_tenants_updated_by' },
				{ type: 'constraint', name: 'fk_tenants_created_by' },
				{ type: 'constraint', name: 'fk_users_tenant' },
				{ type: 'constraint', name: 'fk_user_sessions_user' },
				{ type: 'constraint', name: 'fk_user_roles_tenant' },
				{ type: 'constraint', name: 'fk_user_roles_organization' },
				{ type: 'constraint', name: 'fk_role_permission_mapping_created_by' },
				{ type: 'constraint', name: 'fk_role_permission_mapping_permission' },
				{ type: 'constraint', name: 'fk_organizations_tenant' },
				{ type: 'constraint', name: 'fk_organizations_updated_by' },
				{ type: 'constraint', name: 'fk_organizations_created_by' },
				{ type: 'constraint', name: 'fk_organizations_parent' },
				{ type: 'constraint', name: 'fk_org_user_invites_tenant' },
				{ type: 'constraint', name: 'fk_org_user_invites_org_code' },
				{ type: 'constraint', name: 'fk_org_user_invites_created_by' },
				{ type: 'constraint', name: 'fk_org_user_invites_file' },
				{ type: 'constraint', name: 'fk_org_user_invites_organization_id' },
				{ type: 'constraint', name: 'fk_org_role_requests_tenant' },
				{ type: 'constraint', name: 'fk_org_role_requests_handled_by' },
				{ type: 'constraint', name: 'fk_org_role_requests_organization' },
				{ type: 'constraint', name: 'fk_org_role_requests_role' },
				{ type: 'constraint', name: 'fk_org_role_requests_requester' },
				{ type: 'constraint', name: 'fk_org_features_updated_by' },
				{ type: 'constraint', name: 'fk_org_features_created_by' },
				{ type: 'constraint', name: 'fk_org_features_tenant' },
				{ type: 'constraint', name: 'fk_org_features_organization' },
				{ type: 'constraint', name: 'fk_org_email_domains_updated_by' },
				{ type: 'constraint', name: 'fk_org_email_domains_created_by' },
				{ type: 'constraint', name: 'fk_org_email_domains_tenant' },
				{ type: 'constraint', name: 'fk_org_email_domains_organization_id' },
				{ type: 'constraint', name: 'fk_notification_templates_tenant' },
				{ type: 'constraint', name: 'fk_notification_templates_organization' },
				{ type: 'constraint', name: 'fk_invitations_tenant' },
				{ type: 'constraint', name: 'fk_invitations_organization' },
				{ type: 'constraint', name: 'fk_invitations_created_by' },
				{ type: 'constraint', name: 'fk_forms_tenant' },
				{ type: 'constraint', name: 'fk_forms_organization' },
				{ type: 'constraint', name: 'fk_file_uploads_updated_by' },
				{ type: 'constraint', name: 'fk_file_uploads_created_by' },
				{ type: 'constraint', name: 'fk_file_uploads_tenant' },
				{ type: 'constraint', name: 'fk_file_uploads_organization' },
				{ type: 'constraint', name: 'fk_features_updated_by' },
				{ type: 'constraint', name: 'fk_features_created_by' },
				{ type: 'constraint', name: 'fk_entity_types_updated_by' },
				{ type: 'constraint', name: 'fk_entity_types_created_by' },
				{ type: 'constraint', name: 'fk_entity_types_tenant' },
				{ type: 'constraint', name: 'fk_entity_types_parent' },
				{ type: 'constraint', name: 'fk_entity_types_organization' },
				{ type: 'constraint', name: 'fk_entities_updated_by' },
				{ type: 'constraint', name: 'fk_entities_created_by' },
				{ type: 'constraint', name: 'fk_entities_entity_type' },
			]

			console.log('Removing indexes and constraints...')

			for (const item of itemsToRemove) {
				try {
					if (item.type === 'index') {
						console.log(`Removing index: ${item.name} from table ${item.table}`)
						await queryInterface.removeIndex(item.table, item.name, { transaction })
					} else if (item.type === 'constraint') {
						console.log(`Removing constraint: ${item.name}`)
						// Try to determine which table the constraint belongs to based on naming
						let tableName = ''
						if (item.name.includes('entities_')) tableName = 'entities'
						else if (item.name.includes('entity_types_')) tableName = 'entity_types'
						else if (item.name.includes('features_')) tableName = 'features'
						else if (item.name.includes('file_uploads_')) tableName = 'file_uploads'
						else if (item.name.includes('forms_')) tableName = 'forms'
						else if (item.name.includes('invitations_')) tableName = 'invitations'
						else if (item.name.includes('notification_templates_')) tableName = 'notification_templates'
						else if (item.name.includes('org_email_domains_')) tableName = 'organization_email_domains'
						else if (item.name.includes('org_features_')) tableName = 'organization_features'
						else if (item.name.includes('org_role_requests_')) tableName = 'organization_role_requests'
						else if (item.name.includes('org_user_invites_')) tableName = 'organization_user_invites'
						else if (item.name.includes('organizations_')) tableName = 'organizations'
						else if (item.name.includes('role_permission_mapping_')) tableName = 'role_permission_mapping'
						else if (item.name.includes('user_roles_')) tableName = 'user_roles'
						else if (item.name.includes('user_sessions_')) tableName = 'user_sessions'
						else if (item.name.includes('users_')) tableName = 'users'
						else if (item.name.includes('tenants_')) tableName = 'tenants'

						if (tableName) {
							await queryInterface.removeConstraint(tableName, item.name, { transaction })
						} else {
							console.warn(`Could not determine table for constraint: ${item.name}`)
						}
					}
				} catch (error) {
					console.warn(`Could not remove ${item.type}: ${item.name} - ${error.message}`)
					// Continue with other removals even if one fails
				}
			}

			// Commit the rollback transaction
			await transaction.commit()
			console.log('Rollback completed successfully!')
		} catch (error) {
			// Rollback the rollback transaction if it fails
			await transaction.rollback()
			console.error('Rollback failed:', error.message)
			console.error('Error details:', error)
			throw error
		}
	},
}
