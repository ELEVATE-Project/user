/**
 * @method
 * @name setKey - Sets Key to the redis cache
 * @param {String} key key to save
 * @param {Object | Number | String} value data to save
 * @param {Number} exp key expiration value in seconds
 * @returns {Promise<Object>} Returns the success response
 * @author Aman Gupta
 */
const setKey = async function (key, value, exp) {
	value = JSON.stringify(value)
	const result = await redisClient.set(key, value, {
		// NX: true, // Only set the key if it does not already exist.
		EX: exp,
	})
	return result
}

/**
 * @method
 * @name getKey - Get Key from the redis cache
 * @param {String} key key to get corresponding saved data
 * @returns {Promise<Object>} Returns the saved corresponding object
 * @author Aman Gupta
 */
const getKey = async function (key) {
	const data = await redisClient.get(key)
	return JSON.parse(data)
}

/**
 * @method
 * @name deleteKey - delete key from the redis cache
 * @param {String} key key to get corresponding saved data
 * @returns {Promise<Object>} Returns the deleted corresponding object
 * @author Rakesh
 **/
const deleteKey = async function (key) {
	const data = await redisClient.del(key)
	return JSON.parse(data)
}

module.exports = {
	setKey,
	getKey,
	deleteKey,
}
