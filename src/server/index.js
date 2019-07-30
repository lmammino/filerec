'use strict'

const os = require('os')
const path = require('path')
const Fastify = require('fastify')
const pointOfView = require('point-of-view')
const fastifyStatic = require('fastify-static')
const nunjucks = require('nunjucks')
const pumpify = require('pumpify')
const crypto = require('../utils/crypto')
const fileSaver = require('./fsFileSaver')

const defaultOptions = {
  accepter: () => Promise.resolve(),
  fileSaver: fileSaver,
  logger: true,
  serverName: os.hostname(),
  savePath: path.resolve(path.join(process.cwd(), 'received-files'))
}

async function createServer (opts = {}) {
  const options = Object.assign({}, defaultOptions, opts)

  const { publicKey, privateKey, passphrase } = crypto.createKeyPair()

  const server = Fastify({ logger: options.logger })

  // adds support for binary files transfer
  server.addContentTypeParser('application/octet-stream', async function (req) {
    return req
  })

  // configure and register template system
  const templatesPath = path.join(__dirname, 'ui', 'templates')
  server.register(pointOfView, {
    engine: {
      nunjucks
    },
    templates: templatesPath
  })

  // register static files
  server.register(fastifyStatic, {
    root: path.join(__dirname, 'ui', 'public'),
    prefix: '/public/'
  })

  server.get('/', async (req, reply) => {
    reply.view('index.jinja', {
      title: `Filerec @ ${options.serverName}`,
      serverName: options.serverName,
      serverPath: req.hostname
    })
  })

  server.get('/key', async (req, reply) => {
    reply.header('Content-Type', 'application/x-pem-file')
    return publicKey
  })

  server.post('/file', async (req, reply) => {
    const iv = Buffer.from(req.headers['x-encryption-iv'], 'base64')
    const sealedKey = Buffer.from(req.headers['x-sealed-key'], 'base64')
    const hasFilename = typeof req.headers['x-filename'] !== 'undefined'
    const filename = path.basename(req.headers['x-filename'] || 'unnamed' + Date.now())
    try {
      server.log.info(`${req.ip} connected. Trying to send ${filename}`)
      await options.accepter(options, req.ip, hasFilename, filename)
    } catch (notAcceptedError) {
      reply.status(401)
      return new Error('Request reject or timed out')
    }

    try {
      const dataStream = pumpify(
        req.raw,
        crypto.createDecipherStream(sealedKey, privateKey, passphrase, iv)
      )

      await options.fileSaver(options, dataStream, options.savePath, filename)
      server.log.info(`File saved in ${path.resolve(path.join(options.savePath, filename))}`)
      reply.status(202)
      return { message: 'File received' }
    } catch (transferFailedError) {
      server.log.error(`File transfer failed: ${transferFailedError}`)
      reply.status(500)
      return new Error(`File transfer failed: ${transferFailedError}`)
    }
  })

  return server
}

module.exports = createServer
