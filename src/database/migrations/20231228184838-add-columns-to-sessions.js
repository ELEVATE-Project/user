'use strict'
require('module-alias/register')
const sessionQueries = require('@database/queries/sessions')
const userRequests = require('@requests/user')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('sessions', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addColumn('sessions', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addColumn('sessions', 'type', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'PUBLIC',
		})

		await queryInterface.addColumn('sessions', 'mentor_name', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		// Logic to update mentor names
		const updateMentorNamesInSessions = async () => {
			try {
				const sessionsWithNullMentorName = await sessionQueries.findAll({ mentor_name: null })

				if (sessionsWithNullMentorName.length === 0) {
					console.log('No sessions found with mentor_name as null.')
					return
				}

				const uniqueMentorIds = [...new Set(sessionsWithNullMentorName.map((session) => session.mentor_id))]

				const mentorDetails = (await userRequests.getListOfUserDetails(uniqueMentorIds)).result
				const mentorDetailsMap = Object.fromEntries(mentorDetails.map((mentor) => [mentor.id, mentor]))

				await Promise.all(
					uniqueMentorIds.map(async (mentorId) => {
						const sessionToUpdate = sessionsWithNullMentorName.find(
							(session) => session.mentor_id === mentorId
						)
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
		await updateMentorNamesInSessions()

		// Update existing null values for created_by and updated_by
		await queryInterface.bulkUpdate(
			'sessions',
			{
				created_by: Sequelize.literal('mentor_id'),
				updated_by: Sequelize.literal('mentor_id'),
			},
			{
				created_by: null,
				updated_by: null,
			}
		)

		// Modify columns to disallow null
		await queryInterface.changeColumn('sessions', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})

		await queryInterface.changeColumn('sessions', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('sessions', 'created_by')
		await queryInterface.removeColumn('sessions', 'updated_by')
		await queryInterface.removeColumn('sessions', 'type')
		await queryInterface.removeColumn('sessions', 'mentor_name')
	},
}
