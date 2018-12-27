const EchartReport = require('../../report/EChartReport.js')
const Cache = require('../../cache/Cache.js')
module.exports = {
  upload(call, cb) {
    // 1、响应客户端
    // console.log(call.request)
    cb(null, { res: `Y` })

    // 2、span入池
    let span = call.request
    // span.tracer = JSON.parse(span.tracer)
    span.tags = JSON.parse(span.tags)
    span.logs = JSON.parse(span.logs)
    span.references = JSON.parse(span.references)
    Cache.spanArr.push(span)

    // 3、满足一定条件，生成报告
    if (Cache.spanArr.length >= 2) {
      new EchartReport().gen()
    }
  }
}

// 基础报告
// function baseReport(tracer) {
//   // 生成报告
//   let report = tracer.report('Report')
//   // 报告所有span
//   for (let span of report.spans) {
//       console.log(`${span.operationName()}-${span.durationMs()}ms`)
//       let tags = span.tags()
//       // 标签
//       for (let key in tags) {
//           console.log(`\ttag:{${key}:${tags[key]}}`)
//       }
//       // 日志
//       for (let log of span.logs()) {
//           console.log(`\tlog:${log.fields.event},${log.timestamp}`)
//       }
//       // 关联
//       for (let reference of span.references()) {
//           console.log(`\t${reference.type()}:${reference.referencedContext().span().operationName()}`)
//       }
//   }
// }