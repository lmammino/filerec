'use strict'

const path = require('path')
const ProgressBar = require('progress')
const client = require('./')

async function cmd (argv) {
  const showProgressBar = !argv.noProgressBar

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

  const transferStream = await client.sendFile(host, file)

  let bar = null

  transferStream.on('error', (err) => {
    if (bar) {
      bar.interrupt(err)
    } else {
      console.error(err)
    }
    process.exit(1)
  })

  let previousTransfer = 0
  console.log(`Transferring ${file}`)
  if (showProgressBar) {
    bar = new ProgressBar('Upload > :bar (:percent) - :rate/bps - :etas', {
      total: transferStream.estimatedEncryptedSize,
      width: 30,
      complete: '█',
      incomplete: '░'
    })
    transferStream.on('progress', (progress) => {
      const tickSize = progress.transferred - previousTransfer
      previousTransfer = progress.transferred
      bar.tick(tickSize)
    })
  }

  transferStream.once('finish', (resp) => {
    if (bar) {
      bar.tick(transferStream.estimatedEncryptedSize)
    }
    setImmediate(() => {
      console.log('\nTransfer completed')
    })
  })
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
