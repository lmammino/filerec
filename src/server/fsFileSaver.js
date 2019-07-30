'use strict'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const { pipeline } = require('readable-stream')

function fileSaver (_, dataStream, savePath, fileName) {
  return new Promise((resolve, reject) => {
    mkdirp(savePath, (err) => {
      if (err) {
        return reject(err)
      }

      pipeline(
        dataStream,
        fs.createWriteStream(path.join(savePath, fileName)),
        (err) => {
          if (err) {
            return reject(err)
          }

          return resolve()
        }
      )
    })
  })
}

module.exports = fileSaver
