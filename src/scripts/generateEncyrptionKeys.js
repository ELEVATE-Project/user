const crypto = require('crypto')
console.log('Email Id Encryption Key: ', crypto.randomBytes(32).toString('hex'))
console.log('Email Id Encryption IV:', crypto.randomBytes(16).toString('hex'))
