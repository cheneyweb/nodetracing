module.exports = {
  upload(call, cb) {
    console.log(`${Date.now()}-${JSON.stringify(call.request)}`)
    cb(null, { res: `Y` })
  }
}