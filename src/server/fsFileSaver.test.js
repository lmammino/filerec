'use strict'

const tap = require('tap')
const os = require('os')
const path = require('path')
const fs = require('fs')
const { Readable } = require('readable-stream')
const Proxyquire = require('proxyquire').noPreserveCache().noCallThru()

function createReadableFromString (str) {
  const buff = Buffer.from(str)
  let pointer = 0
  let finished = false
  const stream = new Readable({
    read (size) {
      if (finished) {
        return this.push(null)
      }

      let readEnd = pointer + size
      if (readEnd >= buff.length) {
        readEnd = buff.length
        finished = true
      }

      this.push(buff.slice(pointer, readEnd))
      pointer = readEnd
    }
  })

  return stream
}

tap.test('fsFileSaver should save the dataStream in file in the local filesystem', async (t) => {
  const fileSaver = require('./fsFileSaver')
  const data = 'abcd'.repeat(10000)

  const dataStream = createReadableFromString(data)
  const savePath = os.tmpdir()
  const filename = `filerec-test-file-${~~(Math.random() * 999999)}.txt`

  await fileSaver(undefined, dataStream, savePath, filename)

  const fileContent = fs.readFileSync(path.join(savePath, filename), 'utf8')
  t.equal(fileContent, data)
  t.end()
})

tap.test('fsFileSaver should reject if can\'t create the folder in the local filesystem', async (t) => {
  const fileSaver = Proxyquire('./fsFileSaver', {
    mkdirp: (dirPath, cb) => {
      return cb(new Error(`Can't create folder ${dirPath}`))
    }
  })

  const data = 'abcd'.repeat(10000)

  const dataStream = createReadableFromString(data)
  const savePath = os.tmpdir()
  const filename = `filerec-test-file-${~~(Math.random() * 999999)}.txt`

  await t.rejects(
    () => fileSaver(undefined, dataStream, savePath, filename),
    new Error(`Can't create folder ${savePath}`)
  )
  t.end()
})

// tap.test('fsFileSaver should reject if can\'t write data in the local filesystem', async (t) => {
//   const readableStreamMock = {
//     pipeline () {
//       const args = [...arguments]
//       const cb = args.unshift() // callback is the last argument
//       for (const stream of args) {
//         stream.destroy() // cleans up the passed streams
//       }
//       return cb(new Error(`Can't write on the filesystem`))
//     }
//   }
//
//   const fileSaver = Proxyquire('./fsFileSaver', {
//     'readable-stream': readableStreamMock
//   })
//
//   const data = 'abcd'.repeat(10000)
//
//   const dataStream = createReadableFromString(data)
//   const savePath = os.tmpdir()
//   const filename = `filerec-test-file-${~~(Math.random() * 999999)}.txt`
//
//   await t.rejects(
//     () => fileSaver(undefined, dataStream, savePath, filename),
//     new Error(`Can't write on the filesystem`)
//   )
//   t.end()
// })
