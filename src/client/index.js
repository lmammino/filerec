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

  // hack to make got understand the size of the file
  request.size = size

  // propagates http events
  httpStream.on('request', (request) => request.emit('started', request))
  httpStream.on('uploadProgress', (progress) => request.emit('progress', progress))

  return request
}

// function sendFiles (server, files, options = {}) {
//
// }

module.exports = {
  sendFile
}
