'use strict'

const path = require('path')
const client = require('./')

async function cmd (argv) {
  console.log(argv)

  let host = argv._[1]
  if (typeof host === 'undefined') {
    throw new Error('Missing argument `host`')
  }

  if (!host.startsWith('http://')) {
    host = `http://${host}`
  }

  host = host.replace(/\/$/, '')

  let file = argv._[2]
  if (typeof file === 'undefined') {
    throw new Error('Missing argument `file`')
  }
  file = path.resolve(file)

  // TODO use client function to send the file and show progress bar
  console.log({ host, file })

  const transferStream = await client.sendFile(host, file)

  transferStream.on('progress', (progress) => console.log('progress', progress, transferStream.size))
}

module.exports = {
  handler: cmd,
  builder: (yargs) => yargs
    .usage('$0 send <host> <file>')
    .positional('host', {
      describe: 'The URL of the host including `http://` and port number (no slash at the end)',
      type: 'string'
    })
    .positional('file', {
      describe: 'The path of the file to send',
      type: 'string'
    })
    .option(
      'no-progress-bar', {
        type: 'boolean',
        alias: 'P',
        default: false,
        describe: 'If set it will not display the progress bar'
      }
    )
}
