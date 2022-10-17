const { aes256cbc } = require('elevate-encryption')

module.exports = () => {
	aes256cbc.init(process.env.KEY, process.env.IV)
}
