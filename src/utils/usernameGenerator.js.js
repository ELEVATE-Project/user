// Use a local cache to avoid global variable issues
let cachedNanoid = null
const { customAlphabet } = require('nanoid')
/**
 * Generates a unique, lowercase username with the user's name as a prefix and a random suffix.
 * Note: Uniqueness should be verified by checking against a database.
 *
 * @param {string} name - The user's name to use as the prefix.
 * @returns {Promise<string>} The generated username (e.g., nevil_abc123).
 */
async function generateUniqueUsername(name) {
	// Load and cache nanoid if not already loaded
	if (!cachedNanoid) {
		const { nanoid } = await import('nanoid')
		cachedNanoid = nanoid
	}

	// Sanitize the name: lowercase, remove spaces, and special characters
	const sanitizedName = name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '')
		.slice(0, 10) // Trim to keep username short

	// Generate a shorter random suffix (14 characters)
	const randomSuffix = cachedNanoid(14).toLowerCase() // Ensure suffix is also lowercase

	return `${sanitizedName}_${randomSuffix}`
}

async function generateUniqueCodeString(stringLength = 4) {
	// Define custom alphabet with only A-Z
	const alphabetSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const nanoid = customAlphabet(alphabetSet, stringLength)
	return nanoid()
}

module.exports = { generateUniqueUsername, generateUniqueCodeString }
