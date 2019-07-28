'use strict'

const stream = require('stream')
const tap = require('tap')
const crypto = require('./crypto')

tap.test('crypto.createKeyPair should create a keypair', (t) => {
  const { publicKey, privateKey, passphrase } = crypto.createKeyPair()
  t.type(publicKey, 'string', 'publicKey is a string')
  t.ok(publicKey.indexOf('-----BEGIN PUBLIC KEY-----') !== -1, 'publicKey is in PEM format')
  t.type(privateKey, 'string', 'privateKey is a string')
  t.ok(privateKey.indexOf('-----BEGIN ENCRYPTED PRIVATE KEY-----') !== -1, 'privateKey is in encrypted PEM format')
  t.type(passphrase, 'string', 'passphrase is a string')
  t.match(passphrase, /[0-9A-F]{64}/, 'passphrase is an HEX string long 64 chars')
  t.end()
})

tap.test('crypto.createDecipherStream creates a new stream', (t) => {
  const { publicKey, privateKey, passphrase } = crypto.createKeyPair()
  const iv = crypto.createIv()
  const symmetricKey = crypto.createSymmetricKey()
  const sealedKey = crypto.createSealedKey(symmetricKey, publicKey)

  const decipherStream = crypto.createDecipherStream(sealedKey, privateKey, passphrase, iv)
  t.type(decipherStream, stream.Transform, 'decipherStream is a Transform stream')
  t.end()
})

tap.test('crypto.createIv creates a new random initialization vector', (t) => {
  const iv = crypto.createIv()
  t.type(iv, Buffer, 'iv is a Buffer')
  t.equal(iv.length, 16, 'iv is 16 bytes long')
  t.end()
})

tap.test('crypto.createSymmetricKey creates a new random symmetric key', (t) => {
  const symmetricKey = crypto.createSymmetricKey()
  t.type(symmetricKey, Buffer, 'symmetricKey is a Buffer')
  t.equal(symmetricKey.length, 32, 'iv is 32 bytes long')
  t.end()
})

tap.test('crypto.createSealedKey creates a new sealed key from a server public key', (t) => {
  const { publicKey } = crypto.createKeyPair()
  const symmetricKey = crypto.createSymmetricKey()
  const sealedKey = crypto.createSealedKey(symmetricKey, publicKey)
  t.type(sealedKey, Buffer, 'sealedKey is a Buffer')
  t.equal(sealedKey.length, 256, 'sealedKey is 256 bytes long')
  t.end()
})

tap.test('crypto.createCipherStream creates a new cipher stream', (t) => {
  const symmetricKey = crypto.createSymmetricKey()
  const iv = crypto.createIv()
  const cipherStream = crypto.createCipherStream(symmetricKey, iv)
  t.type(cipherStream, stream.Transform, 'cipherStream is a Transform stream')
  t.end()
})
