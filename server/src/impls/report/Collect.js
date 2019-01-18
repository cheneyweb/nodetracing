const Cache = require('../../cache/Cache.js')
const EChartReport = require('../../report/EChartReport.js')
module.exports = {
  upload(call, cb) {
    let time1 = Date.now()
    // 0、记录上报节点并认证
    Cache.tracingCluster[call.metadata.get('ipv4')[0]] = Date.now()
    // 1、响应客户端
    cb(null, { res: `Y` })
    // 2、获取上报数据
    let spans = JSON.parse(call.request.spans)
    // 3、生成报告
    new EChartReport(spans).gen()
    console.log(`接收单次批量上报用时：${Date.now() - time1}ms`)
  }
}
