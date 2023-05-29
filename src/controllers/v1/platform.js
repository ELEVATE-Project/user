const platformHelper = require('@services/helper/platform')

module.exports = class Config {
	/**
	 * Get app related config details
	 * @method
	 * @name getConfig
	 * @returns {JSON} - returns success response.
	 */

	async config() {
		try {
			const config = await platformHelper.getConfig()
			return config
		} catch (error) {
			return error
		}
	}
}
