require('dotenv').config({ path: '../.env' })
require('module-alias/register')
const { Sequelize } = require('sequelize')
const sessionQueries = require('@database/queries/sessions')
const userRequests = require('@requests/user')

const nodeEnv = process.env.NODE_ENV || 'development'

const databaseUrls = {
	production: process.env.PROD_DATABASE_URL,
	test: process.env.TEST_DATABASE_URL,
	development: process.env.DEV_DATABASE_URL,
}

const databaseUrl = databaseUrls[nodeEnv]

if (!databaseUrl) {
	console.error(`${nodeEnv} DATABASE_URL not found in environment variables.`)
	process.exitCode = 1
} else {
	const sequelize = new Sequelize(databaseUrl, {
		dialect: 'postgres',
	})

	async function updateMentorNamesInSessions() {
		try {
			// Fetch sessions with mentor_name as null
			const sessionsWithNullMentorName = await sessionQueries.findAll({ mentor_name: null })

			if (sessionsWithNullMentorName.length === 0) {
				console.log('No sessions found with mentor_name as null.')
				return
			}

			// Extract mentor_ids from sessions
			const mentorIds = sessionsWithNullMentorName.map((session) => session.mentor_id)

			// Fetch mentorDetails for the corresponding mentor_ids
			const mentorDetails = (await userRequests.getListOfUserDetails(mentorIds)).result

			// Create a map from mentorDetails for faster lookups
			const mentorDetailsMap = Object.fromEntries(mentorDetails.map((mentor) => [mentor.id, mentor]))

			// Update sessions with mentor_name from mentorDetails
			await Promise.all(
				sessionsWithNullMentorName.map(async (session) => {
					const matchingMentor = mentorDetailsMap[session.mentor_id]
					if (matchingMentor) {
						await sessionQueries.updateOne({ id: session.id }, { mentor_name: matchingMentor.name })
					}
				})
			)

			console.log('Mentor names updated successfully.')
		} catch (error) {
			console.error('Error updating mentor names:', error.message)
		}
	}

	// Call the asynchronous function
	updateMentorNamesInSessions()
}
