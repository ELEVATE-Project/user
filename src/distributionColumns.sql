SELECT create_reference_table('features');


SELECT create_distributed_table('entities', 'entity_type_id');
SELECT create_distributed_table('entity_types', 'organization_id');
SELECT create_distributed_table('file_uploads', 'organization_id');
SELECT create_distributed_table('forms', 'organization_id');
SELECT create_distributed_table('notification_templates', 'organization_id');
SELECT create_distributed_table('organizations', 'tenant_code');
SELECT create_distributed_table('organization_codes', 'code');
SELECT create_distributed_table('organization_domains', 'domain');
SELECT create_distributed_table('organization_role_requests','organization_id');
SELECT create_distributed_table('organization_user_invites','organization_id');
SELECT create_distributed_table('users_credentials','email');
SELECT create_distributed_table('users', 'tenant_code');

SELECT create_distributed_table('tenants','code');
SELECT create_distributed_table('tenant_domains','domain');
SELECT create_distributed_table('user_organizations', 'tenant_code');
SELECT create_distributed_table('user_organization_roles', 'tenant_code');
SELECT create_distributed_table('organization_features', 'tenant_code');