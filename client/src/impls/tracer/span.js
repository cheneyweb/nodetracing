module.exports = {
  upload(call, cb) {
    console.log(`${Date.now()}${JSON.stringify(call.request)}`)
    cb(null, { res: `${call.request.username} 成功` })
  }
}