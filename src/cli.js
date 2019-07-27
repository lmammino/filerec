#!/usr/bin/env node

'use strict'

const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const server = require('./server/cli')
const client = require('./client/cli')

updateNotifier({ pkg }).notify()

yargs
  .version()
  .usage('$0 <command> [options]')
  .command(['server', 'start', 'start-server', 's'], 'start a local filerec server', server)
  .command(['send', 'client', 'send-file', 'f'], 'send a file to a given filerec server', client)
  .help('h')
  .alias('h', 'help')
  .parse()
