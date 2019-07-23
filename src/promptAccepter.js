'use strict'

const { Confirm } = require('enquirer')

function promptAccepter (_, ip, hasFilename, fileName) {
  const prompt = new Confirm({
    name: 'File transfer',
    message: `${ip} wants to send you ${hasFilename ? fileName : `an unnamed file (${fileName})`}. Do you want to accept?`
  })

  return prompt.run()
}

module.exports = promptAccepter
