const { genSaltSync, hashSync, compare } = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (tokenData, secretKey, expiresIn) => {
	return jwt.sign(tokenData, secretKey, { expiresIn })
}

const hashPassword = async (password) => {
	const saltRounds = 10
	const salt = await genSaltSync(saltRounds)
	const hashedPassword = await hashSync(password, salt)
	return hashedPassword
}

const comparePassword = async (password, hashedPassword) => {
	return await compare(password, hashedPassword)
}

const auth = { generateToken, hashPassword, comparePassword }

module.exports = auth
