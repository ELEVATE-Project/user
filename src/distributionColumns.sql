SELECT create_reference_table('features');


SELECT create_distributed_table('entities', 'entity_type_id');
SELECT create_distributed_table('entity_types', 'organization_id');
SELECT create_distributed_table('file_uploads', 'tenant_code');
SELECT create_distributed_table('forms', 'tenant_code');
SELECT create_distributed_table('notification_templates', 'tenant_code');
SELECT create_distributed_table('organizations', 'tenant_code');
SELECT create_distributed_table('organization_codes', 'tenant_code');
SELECT create_distributed_table('organization_domains', 'tenant_code');
SELECT create_distributed_table('organization_role_requests','tenant_code');
SELECT create_distributed_table('organization_user_invites','organization_id');
SELECT create_distributed_table('users_credentials','email');
SELECT create_distributed_table('users', 'tenant_code');

SELECT create_distributed_table('tenants','code');
SELECT create_distributed_table('tenant_domains','domain');
SELECT create_distributed_table('user_organizations', 'tenant_code');
SELECT create_distributed_table('user_organization_roles', 'tenant_code');
SELECT create_distributed_table('organization_features', 'tenant_code');
SELECT create_distributed_table('user_roles', 'tenant_code');
