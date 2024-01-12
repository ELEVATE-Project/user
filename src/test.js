require('module-alias/register')
const userRequests = require('@requests/user')
require('dotenv').config()

const permissionsQueries = require('@database/queries/permissions')
const { Op } = require('sequelize')
const { limits } = require('oci-sdk')

const updateMentorNamesBasedOnRole = async () => {
	try {
		const page = 1
		const limit = 10
		const search = 'a'

		const response = await userRequests.getListOfUserRoles(page, limit, search)
		console.log(response)
		console.log('allRoles =>>>>>>>', response)

		const allRoles = response.result.data

		if (!allRoles || !Array.isArray(allRoles)) {
			console.log('No roles found.')
			return
		}

		const roleIds = allRoles.map((role) => role.id)

		const titles = ['session_manager', 'admin']

		const matchingResults = {}

		await Promise.all(
			titles.map(async (title) => {
				const matchingRole = allRoles.find((role) => role.title === title)

				if (matchingRole) {
					console.log(`Matched: ${title} - Role ID: ${matchingRole.id}`)
					// Save the matching role based on title in the object
					matchingResults[title] = matchingRole
				} else {
					console.log(`No matching role found for: ${title}`)
				}
			})
		)

		console.log('Matching results:', matchingResults)

		// Now you can access matching roles using matchingResults['session_manager'], matchingResults['admin'], etc.
		console.log('Mentor names and role ids updated successfully.')
		const filter = { actions: ['ALL'] }
		const attributes = ['id', 'code', 'module', 'actions', 'status']
		const findPermissionId = await permissionsQueries.findByAction(filter, attributes)
		console.log(findPermissionId.result)
	} catch (error) {
		console.error('Error updating mentor names based on role:', error)
	}
}

// Call the function
updateMentorNamesBasedOnRole()
