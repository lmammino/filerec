#!/usr/bin/env node

'use strict'

const createServer = require('./server')
const promptAccepter = require('./promptAccepter')

const server = createServer({
  accepter: promptAccepter
})

server.on('listening', () => {
  console.log(`Listening on port ${server.address().port}`)
})
server.listen({ host: '0.0.0.0', port: 0 })
