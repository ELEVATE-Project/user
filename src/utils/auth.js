const { genSaltSync, hashSync, compare } = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (tokenData, secretKey, expiresIn) => {
	return jwt.sign(tokenData, secretKey, { expiresIn })
}

const hashPassword = (password) => {
	const saltRounds = 10
	const salt = genSaltSync(saltRounds)
	const hashedPassword = hashSync(password, salt)
	return hashedPassword
}

const comparePassword = async (password, hashedPassword) => {
	return await compare(password, hashedPassword)
}

const auth = { generateToken, hashPassword, comparePassword }

module.exports = auth
