'use strict'

async function checkCitus(queryInterface) {
	let isCitusEnabled = false

	try {
		const extensionCheckResult = await queryInterface.sequelize.query(
			`
      SELECT 1 FROM pg_extension WHERE extname = 'citus';
    `,
			{ type: queryInterface.sequelize.QueryTypes.SELECT }
		)
		isCitusEnabled = extensionCheckResult.length > 0
	} catch (error) {
		console.error('Error checking Citus extension:', error.message)
		isCitusEnabled = false
	}

	return isCitusEnabled
}

async function isDistributed(queryInterface, tableName) {
	let isDistributed = false
	try {
		// Check if table is distributed
		const distributionCheckResult = await queryInterface.sequelize.query(`
                SELECT 1 FROM pg_dist_partition WHERE logicalrelid = '${tableName}'::regclass
            `)
		isDistributed = distributionCheckResult[0].length > 0
	} catch (error) {
		isDistributed = false
	}

	return isDistributed
}

const tableName = 'organization_registration_codes'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return await queryInterface.sequelize.transaction(async (transaction) => {
			// Step 2: Remove any index on 'registration_code' (if exists)
			try {
				await queryInterface.removeIndex('organizations', 'registration_code')
			} catch (error) {
				console.log('No index found for registration_code, proceeding...')
			}
			// Step 3: Remove the column
			await queryInterface.removeColumn('organizations', 'registration_code')
		})
	},

	down: async (queryInterface, Sequelize) => {},
}
