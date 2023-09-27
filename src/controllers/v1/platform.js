const platformService = require('@services/platform')

module.exports = class Config {
	/**
	 * Get app related config details
	 * @method
	 * @name getConfig
	 * @returns {JSON} - returns success response.
	 */

	async config() {
		try {
			const config = await platformService.getConfig()
			return config
		} catch (error) {
			return error
		}
	}
}
