const sessionAttendeesQueries = require('@database/queries/sessionAttendees')
const mentorExtensionQueries = require('@database/queries/mentorExtension')
const menteeExtensionQueries = require('@database/queries/userExtension')
const userRequests = require('@requests/user')
const entityTypeService = require('@services/entity-type')
const { Parser } = require('@json2csv/plainjs')

exports.getEnrolledMentees = async (sessionId, queryParams, userID) => {
	try {
		const mentees = await sessionAttendeesQueries.findAll({ session_id: sessionId })
		const menteeIds = mentees.map((mentee) => mentee.mentee_id)
		let menteeTypeMap = {}
		mentees.forEach((mentee) => {
			menteeTypeMap[mentee.mentee_id] = mentee.type
		})
		const options = {
			attributes: {
				exclude: [
					'rating',
					'stats',
					'tags',
					'configs',
					'visibility',
					'visible_to_organizations',
					'external_session_visibility',
					'external_mentor_visibility',
					'experience',
				],
			},
		}
		const [menteeDetails, mentorDetails, attendeesAccounts] = await Promise.all([
			menteeExtensionQueries.getUsersByUserIds(menteeIds, options),
			mentorExtensionQueries.getMentorsByUserIds(menteeIds, options),
			userRequests.getListOfUserDetails(menteeIds).then((result) => result.result),
		])

		// Combine details of mentees and mentors
		let enrolledUsers = [...menteeDetails, ...mentorDetails]
		enrolledUsers.forEach((user) => {
			if (menteeTypeMap.hasOwnProperty(user.user_id)) {
				user.type = menteeTypeMap[user.user_id]
			}
		})

		const CSVFields = [
			{ label: 'No.', value: 'index_number' },
			{ label: 'Name', value: 'name' },
			{ label: 'Designation', value: 'designation' },
			{ label: 'Organization', value: 'organization' },
			{ label: 'E-mail ID', value: 'email' },
			{ label: 'Enrollment Type', value: 'type' },
		]
		const parser = new Parser({
			fields: CSVFields,
			header: true,
			includeEmptyRows: true,
			defaultValue: null,
		})
		//Return an empty CSV/response if list is empty
		if (enrolledUsers.length === 0) {
			return queryParams?.csv === 'true'
				? new Parser({ fields: CSVFields, header: true, includeEmptyRows: true, defaultValue: null }).parse()
				: []
		}

		// Process entity types to add value labels
		const uniqueOrgIds = [...new Set(enrolledUsers.map((user) => user.organization_id))]
		enrolledUsers = await entityTypeService.processEntityTypesToAddValueLabels(
			enrolledUsers,
			uniqueOrgIds,
			[await menteeExtensionQueries.getModelName(), await mentorExtensionQueries.getModelName()],
			'organization_id'
		)

		// Merge arrays based on user_id and id
		const mergedUserArray = enrolledUsers.map((user) => {
			const matchingUserDetails = attendeesAccounts.find((details) => details.id === user.user_id)

			// Merge properties from user and matchingUserDetails

			return matchingUserDetails ? { ...user, ...matchingUserDetails } : user
		})

		if (queryParams?.csv === 'true') {
			const csv = parser.parse(
				mergedUserArray.map((user, index) => ({
					index_number: index + 1,
					name: user.name,
					designation: user.designation
						? user.designation.map((designation) => designation.label).join(', ')
						: '',
					email: user.email,
					type: user.type,
					organization: user.organization.name,
				}))
			)

			return csv
		}

		const propertiesToDelete = [
			'user_id',
			'organization_id',
			'meta',
			'email_verified',
			'gender',
			'location',
			'about',
			'share_link',
			'status',
			'last_logged_in_at',
			'has_accepted_terms_and_conditions',
			'languages',
			'preferred_language',
			'custom_entity_text',
		]

		const cleanedAttendeesAccounts = mergedUserArray.map((user, index) => {
			propertiesToDelete.forEach((property) => {
				delete user[property]
			})
			user.index_number = index + 1
			return user
		})
		// Return success response with merged user details
		return cleanedAttendeesAccounts
	} catch (error) {
		throw error
	}
}
