const account = {
	create: ['id', 'last_logged_in_at', 'refresh_tokens', 'organization_id'],
	login: [
		'id',
		'email_verified',
		'name',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	logout: [
		'id',
		'email',
		'email_verified',
		'name',
		'password',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	generateToken: [
		'id',
		'email',
		'email_verified',
		'name',
		'password',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	generateOtp: [
		'id',
		'email_verified',
		'name',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	registrationOtp: [
		'id',
		'email_verified',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	resetPassword: [
		'id',
		'email_verified',
		'name',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	changeRole: [
		'id',
		'email_verified',
		'name',
		'password',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'organization_id',
		'custom_entity_text',
		'meta',
	],
}
const admin = {
	create: [
		'id',
		'email_verified',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	login: [
		'id',
		'email_verified',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	addOrgAdmin: [
		'id',
		'email_verified',
		'location',
		'about',
		'password',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'roles',
		'custom_entity_text',
		'meta',
	],
	deactivateUser: [
		'email_verified',
		'location',
		'about',
		'password',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
}
const entityType = {
	create: ['id', 'status', 'created_by', 'updated_by', 'organization_id', 'parent_id', 'allow_filtering'],
	update: ['id', 'created_by', 'updated_by', 'allow_filtering', 'organization_id', 'parent_id'],
}

const entity = {
	create: ['id', 'status', 'created_by', 'updated_by'],
	update: ['id', 'entity_type_id', 'created_by', 'updated_by'],
}

const form = {
	create: ['id', 'version', 'organization_id'],
	update: ['id', 'version', 'organization_id'],
}

const modules = {
	create: ['id'],
	update: [],
}

const notification = {
	create: ['id', 'created_by', 'updated_by'],
	update: ['id', 'created_by', 'updated_by'],
}

const orgAdmin = {
	bulkUserCreate: [
		'id',
		'email_verified',
		'name',
		'location',
		'about',
		'share_link',
		'status',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
	updateRequestStatus: [
		'id',
		'email_verified',
		'name',
		'location',
		'about',
		'share_link',
		'image',
		'last_logged_in_at',
		'has_accepted_terms_and_conditions',
		'refresh_tokens',
		'languages',
		'preferred_language',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
	],
}

const organization = {
	create: [
		'id',
		'status',
		'org_admin',
		'parent_id',
		'related_orgs',
		'in_domain_visibility',
		'created_by',
		'updated_by',
	],
	update: ['id', 'org_admin', 'parent_id', 'related_orgs', 'in_domain_visibility', 'created_by', 'updated_by'],
	requestOrgRole: [
		'id',
		'description',
		'status',
		'org_admin',
		'parent_id',
		'related_orgs',
		'in_domain_visibility',
		'created_by',
		'updated_by',
	],
}

const permissions = {
	create: ['id'],
	update: ['id'],
}

const rolePermissionMapping = {
	create: ['created_by'],
	update: ['module', 'request_type', 'api_path', 'created_by'],
}

const userRole = {
	create: ['id', 'organization_id'],
	update: ['id', 'organization_id'],
}

const user = {
	update: [
		'id',
		'share_link',
		'last_logged_in_at',
		'refresh_tokens',
		'organization_id',
		'roles',
		'custom_entity_text',
		'meta',
		'email',
		'email_verified',
		'password',
		'has_accepted_terms_and_conditions',
	],
}

module.exports = {
	account,
	admin,
	entityType,
	entity,
	form,
	modules,
	notification,
	orgAdmin,
	organization,
	permissions,
	rolePermissionMapping,
	userRole,
	user,
}
