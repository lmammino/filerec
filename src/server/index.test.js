'use strict'

const tap = require('tap')
const createServer = require('.')

tap.test('createServer should create a server instance', async (t) => {
  const server = await createServer()
  t.type(server.get, Function, 'the server instance has a .get method')
  t.type(server.post, Function, 'the server instance has a .post method')
  t.type(server.register, Function, 'the server instance has a .register method')
  t.done()
})
