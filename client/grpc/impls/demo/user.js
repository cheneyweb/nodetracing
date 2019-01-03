// 服务实现
module.exports = {
  // 单服务
  login(call, cb) {
    console.log(`${Date.now()}${JSON.stringify(call.request)}`)
    cb(null, { res: `${call.request.username} 登录成功` })
  }
}