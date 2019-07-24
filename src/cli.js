#!/usr/bin/env node

'use strict'

const createServer = require('./server')
const promptAccepter = require('./promptAccepter')

async function run () {
  const server = createServer({
    accepter: promptAccepter
  })

  const address = await server.listen(0, '0.0.0.0')
  console.log(`Listening on port ${address}`)
}

run()
