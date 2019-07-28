'use strict'

const tap = require('tap')
const Proxyquire = require('proxyquire').noPreserveCache().noCallThru()

tap.test('promptAccepter should resolve to true when prompt is accepted', async (t) => {
  let passedName = null
  let passedMessage = null

  const enquirerMock = {
    Confirm: class Confirm {
      constructor ({ name, message }) {
        passedName = name
        passedMessage = message
      }

      run () {
        return Promise.resolve(true)
      }
    }
  }

  const promptAccepter = Proxyquire('./promptAccepter', { enquirer: enquirerMock })
  const promptResult = await promptAccepter(undefined, '168.2.10.17', true, 'someFile.js')

  t.ok(promptResult === true, 'The prompt was accepted')
  t.equal(passedName, 'File transfer', 'A prompt labelled `File transfer` was displayed')
  t.equal(passedMessage, '168.2.10.17 wants to send you "someFile.js". Do you want to accept?', 'Ip and filename were displayed')
  t.end()
})

tap.test('promptAccepter should display unnamed files', async (t) => {
  let passedName = null
  let passedMessage = null

  const enquirerMock = {
    Confirm: class Confirm {
      constructor ({ name, message }) {
        passedName = name
        passedMessage = message
      }

      run () {
        return Promise.resolve(true)
      }
    }
  }

  const promptAccepter = Proxyquire('./promptAccepter', { enquirer: enquirerMock })
  const promptResult = await promptAccepter(undefined, '168.2.10.17', false, 'serverDefinedRandomFilename')

  t.ok(promptResult === true, 'The prompt was accepted')
  t.equal(passedName, 'File transfer', 'A prompt labelled `File transfer` was displayed')
  t.equal(passedMessage, '168.2.10.17 wants to send you an unnamed file ("serverDefinedRandomFilename"). Do you want to accept?', 'Ip and filename were displayed')
  t.end()
})

tap.test('promptAccepter should resolve to false when prompt is NOT accepted', async (t) => {
  const enquirerMock = {
    Confirm: class Confirm {
      run () {
        return Promise.resolve(false)
      }
    }
  }

  const promptAccepter = Proxyquire('./promptAccepter', { enquirer: enquirerMock })
  const promptPromise = promptAccepter(undefined, '168.2.10.17', true, 'someFile.js')

  t.rejects(promptPromise, new Error('Transfer rejected'), 'Prompt not accepted should reject')
  t.end()
})
