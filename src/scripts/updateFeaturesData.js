require('module-alias/register')
const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../.env' })
let environmentData = require('../envVariables')()

const nodeEnv = process.env.NODE_ENV || 'development'

if (!environmentData.success) {
	console.error('Server could not start. Not all environment variables are provided.', {
		triggerNotification: true,
	})
	process.exit()
}

let databaseUrl
switch (nodeEnv) {
	case 'production':
		databaseUrl = process.env.PROD_DATABASE_URL
		break
	case 'test':
		databaseUrl = process.env.TEST_DATABASE_URL
		break
	default:
		databaseUrl = process.env.DEV_DATABASE_URL
}

if (!databaseUrl) {
	console.error(`${nodeEnv} DATABASE_URL not found in environment variables.`)
	process.exit(1)
}

const sequelize = new Sequelize(databaseUrl, {
	dialect: 'postgres',
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

async function updateSequenceNumbers() {
	try {
		await sequelize.authenticate()
		console.log('Connection established successfully.')

		const featureOrder = ['programs', 'project', 'survey', 'observation', 'reports', 'mentoring', 'mitra']

		// 1. Fetch all features ordered by code
		const features = await sequelize.query(`SELECT code FROM features WHERE deleted_at IS NULL`, {
			type: Sequelize.QueryTypes.SELECT,
		})

		// 2. Loop through all features and update based on whether code is in featureOrder
		for (const feature of features) {
			const code = feature.code
			const index = featureOrder.indexOf(code)
			const sequenceNo = index !== -1 ? index + 1 : featureOrder.length + 1

			await sequelize.query(`UPDATE features SET sequence_no = :seq WHERE code = :code AND deleted_at IS NULL`, {
				replacements: {
					seq: sequenceNo,
					code: code,
				},
				type: Sequelize.QueryTypes.UPDATE,
			})
		}
		console.log('Updated sequence_no in features table.')

		// 3. Update organization_features to match feature sequence_no
		for (const feature of features) {
			const [result] = await sequelize.query(`SELECT sequence_no FROM features WHERE code = :code`, {
				replacements: { code: feature.code },
				type: Sequelize.QueryTypes.SELECT,
			})

			if (result && result.sequence_no !== undefined) {
				await sequelize.query(
					`UPDATE organization_features SET sequence_no = :seq WHERE feature_code = :code`,
					{
						replacements: {
							seq: result.sequence_no,
							code: feature.code,
						},
						type: Sequelize.QueryTypes.UPDATE,
					}
				)
			}
		}
		console.log('Updated sequence_no in organization_features table.')

		await sequelize.close()
		console.log('DB connection closed.')
	} catch (error) {
		console.error('Error occurred:', error)
		process.exit(1)
	}
}

updateSequenceNumbers()
