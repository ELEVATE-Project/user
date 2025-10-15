/**
 * Utilities for validating and processing raw SQL SELECT queries
 * @module rawQueryUtils
 */

/**
 * Comprehensive security validation for SQL queries
 * @param {string} query - The raw SQL query to validate
 * @throws {Error} - If validation fails
 */
function validateQuerySecurity(query) {
	const lowerQuery = query.toLowerCase()

	// Check starts with SELECT or WITH
	if (!/^\s*(with|select)\b/.test(lowerQuery)) {
		throw new Error('ONLY_SELECT_QUERIES_ALLOWED')
	}

	// Check for unbalanced quotes
	if (!hasValidQuotes(query)) {
		throw new Error('QUERY_INVALID_OR_UNBALANCED_QUOTES')
	}

	// Check for critical injection patterns
	if (hasCriticalInjectionPatterns(lowerQuery)) {
		throw new Error('QUERY_FORBIDDEN_INJECTION_PATTERNS')
	}

	// Normalize and check for forbidden patterns
	const normalizedQuery = normalizeQuery(query)
	if (hasForbiddenPatterns(normalizedQuery)) {
		throw new Error('QUERY_FORBIDDEN_PATTERNS')
	}
}

/**
 * Calculates pagination parameters with validation
 * @param {number} pageNo - Page number
 * @param {number} pageSize - Page size
 * @returns {Object} - { limit, offset }
 */
function getPaginationParams(pageNo, pageSize) {
	const validPageNo = Math.max(1, parseInt(pageNo) || 1)
	const validPageSize = Math.min(Math.max(1, parseInt(pageSize) || 100), 1000) // Cap at 1000
	const offset = (validPageNo - 1) * validPageSize

	return { limit: validPageSize, offset }
}

/**
 * Checks for critical injection patterns
 * @param {string} lowerQuery - Lowercased query
 * @returns {boolean} - True if critical patterns are found
 */
function hasCriticalInjectionPatterns(lowerQuery) {
	const criticalPatterns = [';', '--', '/*', '*/', '#', '\\']
	return criticalPatterns.some((pattern) => lowerQuery.includes(pattern))
}

/**
 * Removes comments and string literals for pattern analysis
 * @param {string} query - The raw query
 * @returns {string} - Normalized query
 */
function normalizeQuery(query) {
	return query
		.toLowerCase()
		.replace(/\/\*[\s\S]*?\*\//g, ' ') // Remove /* */ comments
		.replace(/--.*$/gm, ' ') // Remove -- comments
		.replace(/#[^\n]*/g, ' ') // Remove # comments
		.replace(/'(?:''|[^'])*'/g, ' ') // Remove single-quoted strings
		.replace(/"(?:""|[^"])*"/g, ' ') // Remove double-quoted strings
		.replace(/\s+/g, ' ') // Normalize whitespace
		.trim()
}

/**
 * Checks if normalized query contains forbidden operations
 * @param {string} normalizedQuery - Normalized query
 * @returns {boolean} - True if forbidden patterns are found
 */
function hasForbiddenPatterns(normalizedQuery) {
	const forbiddenVerbs = /\b(drop|alter|truncate|insert|update|delete)\b/i
	return forbiddenVerbs.test(normalizedQuery)
}

/**
 * Validates balanced quotes with escaping
 * @param {string} query - The raw query
 * @returns {boolean} - True if quotes are balanced
 */
function hasValidQuotes(query) {
	let inSingleQuote = false
	let inDoubleQuote = false

	for (let i = 0; i < query.length; i++) {
		const char = query[i]
		const nextChar = query[i + 1]

		if (!inDoubleQuote && char === "'") {
			if (inSingleQuote && nextChar === "'") {
				i++ // Skip escaped ''
				continue
			}
			inSingleQuote = !inSingleQuote
		} else if (!inSingleQuote && char === '"') {
			if (inDoubleQuote && nextChar === '"') {
				i++ // Skip escaped ""
				continue
			}
			inDoubleQuote = !inDoubleQuote
		}
	}

	return !inSingleQuote && !inDoubleQuote
}

module.exports = {
	validateQuerySecurity,
	getPaginationParams,
	hasCriticalInjectionPatterns,
	normalizeQuery,
	hasForbiddenPatterns,
	hasValidQuotes,
}
