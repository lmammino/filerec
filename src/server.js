'use strict'

const os = require('os')
const fs = require('fs')
const crypto = require('./crypto')
const path = require('path')
const Fastify = require('fastify')
const { pipeline } = require('readable-stream')
// const { getClientIp } = require('request-ip')

const defaultOptions = {
  accepter: () => Promise.resolve(),
  fileSaver: (options, req, savePath, fileName) => new Promise((resolve, reject) => {
    pipeline(
      req,
      fs.createWriteStream(path.join(savePath, fileName)),
      (err) => {
        if (err) {
          return reject(err)
        }

        return resolve()
      }
    )
  }),
  logger: true,
  serverName: os.hostname(),
  savePath: process.cwd()
}

function createServer (opts = {}) {
  const options = Object.assign({}, defaultOptions, opts)
  const { publicKey, privateKey } = crypto.generateKeyPair()
  console.log({ publicKey, privateKey }, JSON.stringify(publicKey, null, 2))

  const server = Fastify({ logger: options.logger })

  server.get('/', async (req, reply) => {
    return 'Hello World'
  })

  server.get('/key', async (req, reply) => {
    return 'put key here'
  })

  server.post('/file', async (req, reply) => {
    return 'here I will copy the file for you'
  })

  // return http.createServer(async function (req, res) {
  //   const ip = getClientIp(req)
  //   const hasFilename = typeof req.headers['x-filename'] !== 'undefined'
  //   const fileName = path.basename(req.headers['x-filename'] || 'unnamed' + Date.now())
  //
  //   try {
  //     options.logger.info(`${ip} connected. Trying to send ${fileName}`)
  //     res.write(`Connected to ${options.serverName}, waiting for file to be accepted...\n`)
  //     await options.accepter(options, ip, hasFilename, fileName)
  //   } catch (notAcceptedError) {
  //     return res.end('File rejected\n')
  //   }
  //
  //   try {
  //     res.write(`File accetepted. Transfer in progress...\n`)
  //     await options.fileSaver(options, req, options.savePath, fileName)
  //     options.logger.info(`File saved in ${path.resolve(path.join(options.savePath, fileName))}`)
  //     res.end('File received\n')
  //   } catch (transferFailedError) {
  //     options.logger.error(`File transfer failed: ${transferFailedError}`)
  //     return res.end(`Transfer failure\n`)
  //   }
  // })

  return server
}

module.exports = createServer
