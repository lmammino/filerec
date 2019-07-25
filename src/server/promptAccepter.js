'use strict'

const { Confirm } = require('enquirer')

function promptAccepter (_, ip, hasFilename, filename) {
  const prompt = new Confirm({
    name: 'File transfer',
    message: `${ip} wants to send you ${hasFilename ? `"${filename}"` : `an unnamed file ("${filename}")`}. Do you want to accept?`
  })

  return prompt.run()
}

module.exports = promptAccepter
