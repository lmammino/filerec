'use strict'

const path = require('path')
const ProgressBar = require('progress')
const client = require('./')

async function cmd (argv) {
  const showProgressBar = argv.progressBar

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

  // start the file transfer
  const transferStream = await client.sendFile(host, file)

  let bar = null
  let previousTransfer = 0
  function progressBarUpdate (progress) {
    const tickSize = progress.transferred - previousTransfer
    previousTransfer = progress.transferred
    bar.tick(tickSize)
  }

  console.log(`Transferring ${file}`)
  if (showProgressBar) {
    bar = new ProgressBar('Upload > :bar (:percent) - :etas', {
      total: transferStream.estimatedEncryptedSize,
      width: 30,
      complete: '█',
      incomplete: '░'
    })
    transferStream.on('progress', progressBarUpdate)
  }

  transferStream.once('finish', (resp) => {
    if (bar) {
      bar.tick(transferStream.estimatedEncryptedSize)
      transferStream.removeListener('progress', progressBarUpdate)
    }
    setImmediate(() => {
      console.log('\nTransfer completed')
    })
  })

  transferStream.on('error', (err) => {
    const errMessage = `Transfer failed: ${err.statusCode} ${err.statusMessage}`
    if (bar) {
      bar.interrupt(errMessage)
      bar.clear = true
      bar.terminate()
    } else {
      console.error(errMessage)
    }
    process.exit(1)
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
      'progress-bar', {
        type: 'boolean',
        alias: 'P',
        default: true,
        describe: 'If set it will display the progress bar. Use --no-progress-bar to disable.'
      }
    )
}
