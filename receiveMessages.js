const fs = require('fs');
const sendMessage = require('./sendMessage');

module.exports = (handleMessage) => {

  process.stdin.on('readable', () => {
    var input = []
    var chunk
    while (chunk = process.stdin.read()) {
      input.push(chunk)
    }
    input = Buffer.concat(input)

    var msgLen = input.readUInt32LE(0)
    var dataLen = msgLen + 4

    if (input.length >= dataLen) {
      var content = input.slice(4, dataLen)
      var json = JSON.parse(content.toString())
      handleMessage(json)
    }
  })

  process.on('uncaughtException', (err) => {
    sendMessage({error: err.toString()})
  })
}