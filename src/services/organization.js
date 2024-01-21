'use strict'
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const organisationExtensionQueries = require('@database/queries/organisationExtension')
const questionsSetQueries = require('../database/queries/questionSet')
const { Op } = require('sequelize')

module.exports = class OrganizationService {
	static async update(bodyData, decodedToken) {
		try {
			if (!decodedToken.roles.some((role) => role.title === common.ORG_ADMIN_ROLE)) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			const questionSets = await questionsSetQueries.findQuestionsSets(
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
				return common.failureResponse({
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
			return common.successResponse({
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

	static async create(organizationId, creatorId) {
		try {
			const extensionData = {
				organization_id: organizationId,
				...common.DEFAULT_ORGANISATION_POLICY,
				created_by: creatorId,
				updated_by: creatorId,
			}
			const orgExtension = await organisationExtensionQueries.upsert(extensionData)
			return common.successResponse({
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
}
