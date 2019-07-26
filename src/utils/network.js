'use strict'

const { networkInterfaces } = require('os')

function getInterfaces () {
  const interfaces = []
  const ifaces = networkInterfaces()

  Object.keys(ifaces).forEach(function (ifname) {
    let alias = 0

    ifaces[ifname].forEach(function (iface) {
      if (iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1)
        return
      }

      if (alias >= 1) {
        // this single interface has multiple addresses
        interfaces.push({ name: `${ifname}:${alias}`, address: iface.address, isIpv4: iface.family === 'IPv4' })
      } else {
        // this interface has only one adress
        interfaces.push({ name: ifname, address: iface.address, isIpv4: iface.family === 'IPv4' })
      }
      ++alias
    })
  })

  return interfaces
}

module.exports = {
  getInterfaces
}
