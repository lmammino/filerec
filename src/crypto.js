'use strict'

const crypto = require('crypto')

function createKeyPair () {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: 'top secret'
    }
  })
}

function createDecipherStream (key, iv) {
  // TODO
}

module.exports = {
  createKeyPair,
  createDecipherStream
}
