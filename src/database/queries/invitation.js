'use strict'
const { Invitation, sequelize } = require('@database/models/index')
const { Op } = require('sequelize')

exports.create = async (data) => {
	try {
		const createdInvitation = await Invitation.create(data)
		return createdInvitation.get({ plain: true })
	} catch (error) {
		console.error(error)
		throw error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await Invitation.findOne({
			where: filter,
			attributes: options.attributes || undefined,
			...options,
			raw: true,
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}

exports.findAll = async (filter = {}, options = {}) => {
	try {
		return await Invitation.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}

exports.update = async (filter, updates) => {
	try {
		return await Invitation.update(updates, {
			where: filter,
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}
