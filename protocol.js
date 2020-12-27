const fs = require('fs');

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

  function sendMessage (msg) {
    // format the response to always send {data: msg} or {error: msg}
    // this makes it easier to use sendMessage for the default case: sendMessage('foo') instead of sendMessage({data: 'foo'})
    if (!msg.hasOwnProperty('data') && !msg.hasOwnProperty('error')) {
      msg = {data: msg};
    }
    var buffer = Buffer.from(JSON.stringify(msg))

    var header = Buffer.alloc(4)
    header.writeUInt32LE(buffer.length, 0)

    var data = Buffer.concat([header, buffer])
    process.stdout.write(data)
  }

  process.on('uncaughtException', (err) => {
    sendMessage({error: err.toString()})
  })

  return sendMessage

}