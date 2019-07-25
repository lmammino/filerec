'use strict'

const crypto = require('crypto')

function createKeyPair () {
  const passphrase = crypto.randomBytes(32).toString('hex').toUpperCase()
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase
    }
  })

  return {
    publicKey,
    privateKey,
    passphrase
  }
}

function createDecipherStream (sealedKey, privateKey, passphrase, iv) {
  const pk = crypto.createPrivateKey({
    key: privateKey,
    type: 'pkcs8',
    format: 'pem',
    passphrase,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
  })
  const key = crypto.privateDecrypt(pk, sealedKey).toString()
  const stream = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv)
  stream.setAutoPadding(false)

  return stream
}

module.exports = {
  createKeyPair,
  createDecipherStream
}
