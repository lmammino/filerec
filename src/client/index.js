'use strict'

const fs = require('fs')
const path = require('path')
const got = require('got')
const pumpify = require('pumpify')
const crypto = require('../utils/crypto')

async function sendFile (server, file, options = {}) {
  // get server public key
  const serverPublicKey = (await got(`${server}/key`)).body

  const symmetricKey = crypto.createSymmetricKey()
  const iv = crypto.createIv()
  const sealedKey = crypto.createSealedKey(symmetricKey, serverPublicKey)

  const headers = {
    'Content-Type': 'application/octet-stream',
    'X-Sealed-Key': sealedKey.toString('base64'),
    'X-Encryption-IV': iv.toString('base64'),
    'X-Filename': path.basename(file)
  }

  const { size } = fs.statSync(file)
  const fileStream = fs.createReadStream(file)
  const encryptionStream = crypto.createCipherStream(symmetricKey, iv)
  const httpStream = got.stream.post(`${server}/file`, { headers })

  const request = pumpify(
    fileStream,
    encryptionStream,
    httpStream
  )

  // set the original size and estimatedEncryptedSize
  request.originalSize = size
  request.estimatedEncryptedSize = size + (16 - (size % 16))

  // propagates http progress event
  httpStream.on('uploadProgress', (progress) => request.emit('progress', progress))
  httpStream.on('error', (err) => request.emit('error', err))

  return request
}

module.exports = {
  sendFile
}
