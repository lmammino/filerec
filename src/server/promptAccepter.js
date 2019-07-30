'use strict'

const { Confirm } = require('enquirer')

function promptAccepter (_, ip, hasFilename, filename) {
  return new Promise((resolve, reject) => {
    const prompt = new Confirm({
      name: 'File transfer',
      message: `${ip} wants to send you ${hasFilename ? `"${filename}"` : `an unnamed file ("${filename}")`}. Do you want to accept?`
    })

    prompt
      .run()
      .then((val) => {
        if (val) {
          return resolve(val)
        }

        return reject(new Error('Transfer rejected'))
      })
      .catch(reject)
  })
}

module.exports = promptAccepter
