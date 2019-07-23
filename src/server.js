'use strict'

const os = require('os')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { getClientIp } = require('request-ip')

const defaultOptions = {
  accepter: () => Promise.resolve(),
  fileSaver: (options, req, savePath, fileName) => new Promise((resolve, reject) => {
    req.pipe(fs.createWriteStream(path.join(savePath, fileName)))
      .on('error', reject)
      .on('finish', resolve)
  }),
  logger: console,
  serverName: os.hostname(),
  savePath: process.cwd()
}

function createServer (opts = {}) {
  const options = Object.assign({}, defaultOptions, opts)

  return http.createServer(async function (req, res) {
    const ip = getClientIp(req)
    const hasFilename = typeof req.headers['x-filename'] !== 'undefined'
    const fileName = path.basename(req.headers['x-filename'] || 'unnamed' + Date.now())

    try {
      options.logger.info(`${ip} connected. Trying to send ${fileName}`)
      res.write(`Connected to ${options.serverName}, waiting for file to be accepted...\n`)
      await options.accepter(options, ip, hasFilename, fileName)
    } catch (notAcceptedError) {
      return res.end('File rejected\n')
    }

    try {
      res.write(`File accetepted. Transfer in progress...\n`)
      await options.fileSaver(options, req, options.savePath, fileName)
      options.logger.info(`File saved in ${path.resolve(path.join(options.savePath, fileName))}`)
      res.end('File received\n')
    } catch (transferFailedError) {
      options.logger.error(`File transfer failed: ${transferFailedError}`)
      return res.end(`Transfer failure\n`)
    }
  })
}

module.exports = createServer
