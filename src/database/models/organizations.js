module.exports = (sequelize, DataTypes) => {
	const organizations = sequelize.define('organizations', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		code: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		org_admin: DataTypes.ARRAY(DataTypes.INTEGER),
		parent_id: DataTypes.INTEGER,
		related_orgs: DataTypes.ARRAY(DataTypes.INTEGER),
		in_domain_visibility: DataTypes.STRING,
	})
	organizations.associate = (models) => {
		organizations.hasMany(models.users, { foreignKey: 'organization_id' })
	}
	return organizations
}
