'use strict'

async function checkCitus(queryInterface) {
	let isCitusEnabled = false

	try {
		const [extensionCheckResult] = await queryInterface.sequelize.query(`
            SELECT 1 FROM pg_extension WHERE extname = 'citus';
        `)
		isCitusEnabled = extensionCheckResult.length > 0
	} catch (error) {
		console.error('Error checking Citus extension:', error.message)
		isCitusEnabled = false
	}

	return isCitusEnabled
}

const tableName = 'invitations'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const isCitusEnabled = await checkCitus(queryInterface)

		await queryInterface.createTable(tableName, {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			file_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			editable_fields: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
				defaultValue: null,
			},
			valid_till: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			created_by: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			tenant_code: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			deleted_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
		})

		await queryInterface.addConstraint(tableName, {
			fields: ['file_id', 'tenant_code'],
			type: 'unique',
			name: 'invitations_file_id_tenant_code_unique',
		})
		if (isCitusEnabled) {
			// for foreign key relation to work , make sure related table is distributed in a citus env
			await queryInterface.sequelize.query(`
                SELECT create_distributed_table('file_uploads', 'tenant_code');
            `)
		}
		await queryInterface.addConstraint(tableName, {
			fields: ['file_id', 'tenant_code'],
			type: 'foreign key',
			name: 'fk_organization_user_invites_invitation_id',
			references: {
				table: 'file_uploads',
				fields: ['id', 'tenant_code'],
			},
			onUpdate: 'NO ACTION',
			onDelete: 'CASCADE',
		})

		if (isCitusEnabled) {
			await queryInterface.sequelize.query(`
                SELECT create_distributed_table('${tableName}', 'tenant_code');
            `)
		}
	},

	down: async (queryInterface, Sequelize) => {
		const isCitusEnabled = await checkCitus(queryInterface)

		try {
			const [foreignKeys] = await queryInterface.sequelize.query(`
                SELECT
                    tc.constraint_name,
                    tc.table_name
                FROM
                    information_schema.table_constraints AS tc
                    JOIN information_schema.constraint_table_usage AS ctu
                    ON tc.constraint_name = ctu.constraint_name
                WHERE
                    tc.constraint_type = 'FOREIGN KEY'
                    AND ctu.table_name = 'invitations';
            `)

			for (const fk of foreignKeys) {
				console.log(`Removing foreign key ${fk.constraint_name} from table ${fk.table_name}`)
				await queryInterface.removeConstraint(fk.table_name, fk.constraint_name)
			}
		} catch (error) {
			console.error('Error removing foreign key constraints:', error.message)
		}

		if (isCitusEnabled) {
			await queryInterface.sequelize.query(`
                SELECT undistribute_table('${queryInterface.quoteIdentifier(
					tableName
				)}', cascade_via_foreign_keys=>true);
            `)
		}

		try {
			await queryInterface.removeConstraint(tableName, 'invitations_file_id_tenant_code_unique')
		} catch (error) {
			console.log('Unique constraint invitations_file_id_tenant_code_unique not found, skipping.')
		}
		await queryInterface.dropTable(tableName)
	},
}
