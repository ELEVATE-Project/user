create extension citus

-- Step 1: Create reference tables first
SELECT create_reference_table('features');

-- Step 2: Distribute primary, top-level tenant-scoped tables early
SELECT create_distributed_table('tenants','code');
SELECT create_distributed_table('users', 'tenant_code');
SELECT create_distributed_table('organizations', 'tenant_code');
SELECT create_distributed_table('entity_types', 'tenant_code');

-- Step 3: Then distribute dependent tables (ensure matching shard keys!)
SELECT create_distributed_table('entities', 'tenant_code');
SELECT create_distributed_table('forms', 'tenant_code');
SELECT create_distributed_table('notification_templates', 'tenant_code');
SELECT create_distributed_table('file_uploads', 'tenant_code');
SELECT create_distributed_table('user_sessions', 'tenant_code');

-- Organization-related tables
SELECT create_distributed_table('organization_email_domains', 'tenant_code');
SELECT create_distributed_table('organization_features', 'tenant_code');

-- Invitation / user-related
SELECT create_distributed_table('invitations','tenant_code');
SELECT create_distributed_table('organization_user_invites','tenant_code');

SELECT create_distributed_table('user_roles', 'tenant_code');
SELECT create_distributed_table('organization_role_requests','tenant_code');

SELECT create_distributed_table('user_organizations', 'tenant_code');
SELECT create_distributed_table('user_organization_roles', 'tenant_code');
--SELECT create_distributed_table('users_credentials','email'); -- ⚠️ distribution by email will break colocation

-- Tenant-domain related
SELECT create_distributed_table('tenant_domains','domain'); -- ⚠️ different colocation

