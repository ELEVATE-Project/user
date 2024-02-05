'use strict'
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const organisationExtensionQueries = require('@database/queries/organisationExtension')
const questionSetQueries = require('../database/queries/question-set')
const { Op } = require('sequelize')
const { eventListenerRouter } = require('@helpers/eventListnerRouter')
const responses = require('@helpers/responses')

module.exports = class OrganizationService {
	static async update(bodyData, decodedToken) {
		try {
			if (!decodedToken.roles.some((role) => role.title === common.ORG_ADMIN_ROLE)) {
				return responses.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			const questionSets = await questionSetQueries.findQuestionSets(
				{
					code: { [Op.in]: [bodyData.mentee_feedback_question_set, bodyData.mentor_feedback_question_set] },
				},
				['id', 'code']
			)
			if (
				questionSets.length === 0 ||
				(questionSets.length === 1 &&
					bodyData.mentee_feedback_question_set !== bodyData.mentor_feedback_question_set)
			) {
				return responses.failureResponse({
					message: 'QUESTIONS_SET_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const extensionData = {
				organization_id: decodedToken.organization_id,
				mentee_feedback_question_set: bodyData.mentee_feedback_question_set,
				mentor_feedback_question_set: bodyData.mentor_feedback_question_set,
				updated_by: decodedToken.id,
			}
			const orgExtension = await organisationExtensionQueries.upsert(extensionData)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_DEFAULT_QUESTION_SETS_SET_SUCCESSFULLY',
				result: {
					organization_id: orgExtension.organization_id,
					mentee_feedback_question_set: orgExtension.mentee_feedback_question_set,
					mentor_feedback_question_set: orgExtension.mentor_feedback_question_set,
					updated_by: orgExtension.updated_by,
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async createOrgExtension(eventBody) {
		try {
			const extensionData = {
				organization_id: eventBody.entityId,
				...common.DEFAULT_ORGANISATION_POLICY,
				created_by: eventBody.created_by,
				updated_by: eventBody.created_by,
			}
			const orgExtension = await organisationExtensionQueries.upsert(extensionData)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ORG_EXTENSION_CREATED_SUCCESSFULLY',
				result: {
					organization_id: orgExtension.organization_id,
				},
			})
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError')
				throw new Error(`Extension Already Exist For Organization With Id: ${organizationId}`)
			else throw error
		}
	}

	static async eventListener(eventBody) {
		try {
			//EventBody Validation - TODO: Check if this should be a middleware
			const { entity, eventType, entityId } = eventBody
			if (!entity || !eventType || !entityId)
				throw new Error('Entity, EventType & EntityId values are mandatory for an Event')
			return await eventListenerRouter(eventBody, {
				createFn: this.createOrgExtension,
			})
		} catch (error) {
			console.log(error)
			return error
		}
	}
}
