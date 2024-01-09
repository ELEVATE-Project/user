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

			// Extract unique mentor_ids from sessions
			const uniqueMentorIds = [...new Set(sessionsWithNullMentorName.map((session) => session.mentor_id))]

			// Fetch mentorDetails for the unique mentor_ids
			const mentorDetails = (await userRequests.getListOfUserDetails(uniqueMentorIds)).result

			// Create a map from mentorDetails for faster lookups
			const mentorDetailsMap = Object.fromEntries(mentorDetails.map((mentor) => [mentor.id, mentor]))

			// Loop through unique mentor_ids and update sessions with mentor_name
			await Promise.all(
				uniqueMentorIds.map(async (mentorId) => {
					const sessionToUpdate = sessionsWithNullMentorName.find((session) => session.mentor_id === mentorId)
					const matchingMentor = mentorDetailsMap[mentorId]

					if (sessionToUpdate && matchingMentor) {
						await sessionQueries.updateOne(
							{ mentor_id: sessionToUpdate.mentor_id },
							{ mentor_name: matchingMentor.name }
						)
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
