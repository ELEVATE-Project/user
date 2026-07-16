'use strict'
const crypto = require('crypto')

const secretKey = Buffer.from(process.env.EMAIL_ID_ENCRYPTION_KEY, 'hex')
const fixedIV = Buffer.from(process.env.EMAIL_ID_ENCRYPTION_IV, 'hex')
const algorithm = process.env.EMAIL_ID_ENCRYPTION_ALGORITHM

const encrypt = (plainTextEmail) => {
	try {
		const cipher = crypto.createCipheriv(algorithm, secretKey, fixedIV)
		return cipher.update(plainTextEmail, 'utf-8', 'hex') + cipher.final('hex')
	} catch (err) {
		console.log(err)
		throw err
	}
}

const decrypt = (encryptedEmail) => {
	try {
		if (typeof encryptedEmail !== 'string' || encryptedEmail.trim() === '') {
			return encryptedEmail
		}
		const decipher = crypto.createDecipheriv(algorithm, secretKey, fixedIV)
		return decipher.update(encryptedEmail, 'hex', 'utf-8') + decipher.final('utf-8')
	} catch (err) {
		// Legacy rows written before encryption was enforced on every write path are stored as
		// plaintext. aes-256-cbc requires block-aligned ciphertext, so decrypting plaintext throws
		// ERR_OSSL_WRONG_FINAL_BLOCK_LENGTH/ERR_OSSL_BAD_DECRYPT instead of returning garbage - treat
		// that as "already plaintext" rather than crashing the caller.
		if (err.code === 'ERR_OSSL_WRONG_FINAL_BLOCK_LENGTH' || err.code === 'ERR_OSSL_BAD_DECRYPT') {
			// Do not log the value itself - it is either plaintext PII or corrupted ciphertext.
			// Flagging that this happened (without the value) keeps the fallback from silently
			// masking rows that still need to be re-encrypted/cleaned up.
			console.warn(
				`[emailEncryption] decrypt() received a non-decryptable value (code: ${err.code}). Returning it unchanged - this row is likely legacy plaintext and should be re-encrypted.`
			)
			return encryptedEmail
		}
		console.log(err)
		throw err
	}
}
const emailEncryption = { encrypt, decrypt }

module.exports = emailEncryption
