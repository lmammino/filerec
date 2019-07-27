#!/usr/bin/env node

'use strict'

const assert = require('assert')
const PinoColada = require('pino-colada')
const { pipeline } = require('readable-stream')

const createServer = require('./')
const promptAccepter = require('./promptAccepter')

async function cmd (argv) {
  // once we run, every non handled promise will make the process crash
  require('make-promises-safe')

  const server = await startServer(argv)

  return server
}

async function startServer (opts) {
  opts.port = opts.port || process.env.PORT || 0

  const options = {
    logger: {
      level: opts.logLevel
    },

    pluginTimeout: opts.pluginTimeout
  }

  if (opts.bodyLimit) {
    options.bodyLimit = opts.bodyLimit
  }

  if (opts.prettyLogs) {
    const pinoColada = PinoColada()
    options.logger.stream = pinoColada
    pipeline(pinoColada, process.stdout, assert.ifError)
  }

  options.accepter = opts.autoAccept ? undefined : promptAccepter
  options.allowPlainText = Boolean(opts.plainText)

  const server = await createServer(options)

  if (opts.address) {
    await server.listen(opts.port, opts.address)
  } else if (opts.socket) {
    await server.listen(opts.socket)
  } else {
    await server.listen(opts.port)
  }

  return server
}

module.exports = {
  handler: cmd,
  builder: (yargs) => yargs
    .option(
      'auto-accept', {
        type: 'boolean',
        alias: 'A',
        default: false,
        describe: 'If set it will automatically accept incoming requests'
      }
    )
    .option(
      'plain-text', {
        type: 'boolean',
        alias: 'T',
        default: false,
        describe: 'If set it will allow plain text transfer'
      }
    )
    .option(
      'port', {
        type: 'number',
        alias: 'p',
        default: 0,
        describe: 'Port to listen on (default to `0`, which will select a random free port)'
      }
    )
    .option(
      'address', {
        type: 'string',
        alias: 'a',
        default: '0.0.0.0',
        describe: 'Address to listen on'
      }
    )
    .option(
      'socket', {
        type: 'string',
        alias: 's',
        describe: 'Socket to listen on'
      }
    )
    .option(
      'log-level', {
        choices: ['off', 'fatal', 'error', 'warn', 'info', 'debug', 'trace', 'all'],
        alias: 'l',
        default: 'info',
        describe: 'Server log level'
      }
    )
    .option(
      'pretty-logs', {
        type: 'boolean',
        alias: 'P',
        default: false,
        describe: 'Prints pretty logs with lots of colors and emojis'
      }
    )
    .option(
      'body-limit', {
        type: 'number',
        alias: 'B',
        describe: 'Defines the maximum payload, in bytes, the server is allowed to accept'
      }
    )
}
