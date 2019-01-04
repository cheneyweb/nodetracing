const EChartReport = require('../../report/EChartReport.js')
module.exports = {
  upload(call, cb) {
    // 1、响应客户端
    cb(null, { res: `Y` })
    // 2、获取上报数据
    let rootSpans = JSON.parse(call.request.rootSpans)
    let childSpans = JSON.parse(call.request.childSpans)
    // 3、生成报告
    new EChartReport().gen({ rootSpans, childSpans })
  }
}
