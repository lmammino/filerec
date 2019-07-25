#!/usr/bin/env node

'use strict'

const createServer = require('./server/server')
const promptAccepter = require('./server/promptAccepter')

async function run () {
  const server = await createServer({
    accepter: promptAccepter
  })

  await server.listen(0, '0.0.0.0')
}

run()
