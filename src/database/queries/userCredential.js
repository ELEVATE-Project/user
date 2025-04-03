'use strict'
const UserCredential = require('@database/models/index').UserCredential
const { UniqueConstraintError, ValidationError } = require('sequelize')

exports.create = async (data, transaction = null) => {
	try {
		const res = await UserCredential.create(data, { transaction })
		return res.get({ plain: true })
	} catch (error) {
		if (error instanceof UniqueConstraintError) {
			throw new Error('User already exists')
		} else if (error instanceof ValidationError) {
			let message
			error.errors.forEach((err) => {
				message = `${err.path} cannot be null.`
			})
			throw new Error(message)
		} else {
			throw error
		}
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await UserCredential.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.log(error)
		throw error
	}
}

exports.updateUser = async (filter, update, options = {}, transaction = null) => {
	try {
		// Add the transaction to the options if it's provided
		const updateOptions = {
			where: filter,
			...options,
			individualHooks: true,
			transaction, // Add transaction if it's passed
		}

		// Perform the update
		return await UserCredential.update(update, updateOptions)
	} catch (error) {
		console.log(error)
		throw error
	}
}

exports.forceDeleteUserWithEmail = async (email) => {
	try {
		return await UserCredential.destroy({
			where: {
				email,
			},
			force: true, // Setting force to true for a hard delete
		})
	} catch (error) {
		throw error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await UserCredential.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		console.log(error)
		throw error
	}
}
