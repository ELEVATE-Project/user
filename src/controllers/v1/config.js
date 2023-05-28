const configHelper = require('@services/helper/config')

module.exports = class Config {
	/**
	 * Get app related config details
	 * @method
	 * @name getConfig
	 * @returns {JSON} - returns success response.
	 */

	async getConfig() {
		try {
			const config = await configHelper.getConfig()
			return config
		} catch (error) {
			return error
		}
	}
}
