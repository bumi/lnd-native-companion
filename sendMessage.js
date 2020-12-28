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

module.exports = sendMessage;
