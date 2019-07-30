'use strict'

const tap = require('tap')
const yargs = require('yargs')
const Proxyquire = require('proxyquire').noPreserveCache().noCallThru()
const promptAccepter = require('./promptAccepter')

tap.test('cli.builder is a function that returns an object', (t) => {
  const cli = require('./cli')
  t.type(cli.builder, Function, 'cli.builder is a function')
  const y = cli.builder(yargs)
  t.type(y, Object, 'cli.builder returns a yargs instance')
  t.end()
})

tap.test('cli.cmd should propagate the right options to the server', async (t) => {
  let createArgs = {}
  let listenArgs = []

  const cli = Proxyquire('./cli', {
    './index': function createServer (opts) {
      createArgs = opts
      return new Promise((resolve, reject) => {
        return resolve({
          listen (arg1, arg2) {
            return new Promise((resolve, reject) => {
              listenArgs = [arg1, arg2]
              return resolve()
            })
          }
        })
      })
    }
  })

  // default options
  await cli.handler({})

  t.equals(listenArgs[0], 0, 'By default it listen to port 0 (random available port)')
  t.equals(listenArgs[1], undefined, 'By default it listen to an undefined address')
  t.equals(createArgs.allowPlainText, false, 'By default it doesn\'t allow plain text')
  t.equals(createArgs.accepter, promptAccepter, 'It uses the default prompt accepter')
  t.equals(createArgs.logger.level, 'info', 'By default uses an INFO level logger')

  // custom options
  await cli.handler({
    bodyLimit: 1024,
    prettyLogs: true,
    plainText: true,
    port: 1987,
    address: '127.0.0.1',
    autoAccept: true
  })

  t.equals(listenArgs[0], 1987, 'It listens to the port specified as option')
  t.equals(listenArgs[1], '127.0.0.1', 'It listens to the address specified as option')
  t.equals(createArgs.allowPlainText, true, 'Enables plain text if specified in the options')
  t.equals(createArgs.accepter, undefined, 'It does\'t use an accepter if `autoAccept` is `true`')
  t.equals(createArgs.logger.stream.constructor.name, 'DestroyableTransform', 'It enables pretty logging if specified')

  t.end()
})
