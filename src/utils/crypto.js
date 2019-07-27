'use strict'

const crypto = require('crypto')

// create key pair for the server
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

// create decipher stream for the server
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

// create iv for the client
function createIv () {
  return crypto.randomBytes(16)
}

// create symmetric key for the client
function createSymmetricKey () {
  return crypto.randomBytes(32)
}

// create sealed key for the client
function createSealedKey (symmetricKey, serverPublicKey) {
  return crypto.publicEncrypt(serverPublicKey, symmetricKey)
}

// create an encryption stream for the client
function createCipherStream (symmetricKey, iv) {
  return crypto.createCipheriv('aes-256-cbc', symmetricKey, iv)
}

module.exports = {
  createKeyPair,
  createDecipherStream,
  createIv,
  createSymmetricKey,
  createSealedKey,
  createCipherStream
}
