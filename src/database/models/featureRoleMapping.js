module.exports = (sequelize, DataTypes) => {
	const FeatureRoleMapping = sequelize.define(
		'FeatureRoleMapping',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			role_title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			feature_code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			organization_code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			tenant_code: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
		},
		{
			modelName: 'FeatureRoleMapping',
			tableName: 'feature_role_mapping',
			freezeTableName: true,
			paranoid: false,
		}
	)

	FeatureRoleMapping.associate = function (models) {
		// Association with Feature model
		FeatureRoleMapping.belongsTo(models.Feature, {
			foreignKey: 'feature_code',
			targetKey: 'code',
			as: 'feature',
		})

		// Association with UserRole model
		FeatureRoleMapping.belongsTo(models.UserRole, {
			foreignKey: {
				name: 'role_title',
				allowNull: false,
			},
			targetKey: 'title',
			constraints: false,
			as: 'userRole',
		})

		// Association with Organization model
		FeatureRoleMapping.belongsTo(models.Organization, {
			foreignKey: {
				name: 'organization_code',
				allowNull: false,
			},
			targetKey: 'code',
			constraints: false,
			as: 'organization',
		})

		// Association with Tenant model
		FeatureRoleMapping.belongsTo(models.Tenant, {
			foreignKey: 'tenant_code',
			targetKey: 'code',
			as: 'tenant',
		})
	}

	return FeatureRoleMapping
}
