'use strict'
const md5 = require('md5')

/**
 * Check if an object is empty.
 * @param {Object} obj - The object to check.
 * @returns {boolean} Returns true if the object is empty, false otherwise.
 */
exports.isEmpty = (obj) => {
	for (let i in obj) return false
	return true
}

/**
 * Generate an MD5 hash for the given value.
 * @param {string} value - The value to hash.
 * @returns {string} Returns the MD5 hash.
 */
exports.md5Hash = (value) => md5(value)

/**
 * Check if a value is numeric.
 * @param {string} value - The value to check.
 * @returns {boolean} Returns true if the value is numeric, false otherwise.
 */
exports.isNumeric = (value) => /^\d+$/.test(value)

/**
 * Check if a name is valid.
 * @param {string} name - The name to check.
 * @returns {boolean} Returns true if the name is valid, false otherwise.
 */
exports.isValidName = (name) => /^[A-Za-z\s'-]+$/.test(name)

/**
 * Check if an email address is valid.
 * @param {string} email - The email address to check.
 * @returns {boolean} Returns true if the email address is valid, false otherwise.
 */
exports.isValidEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}
