const EchartReport = require('../../report/EChartReport.js')
const Cache = require('../../cache/Cache.js')
module.exports = {
  upload(call, cb) {
    // 1、响应客户端
    // console.log(call.request)
    cb(null, { res: `Y` })

    // 2、span压入队列
    let span = call.request
    // span.tracer = JSON.parse(span.tracer)
    span.tags = JSON.parse(span.tags)
    span.logs = JSON.parse(span.logs)
    span.references = JSON.parse(span.references)
    span.startMs = +span.startMs
    span.finishMs = +span.finishMs
    Cache.spanQueue.push(span)

    // 3、满足一定条件，生成报告
    let spanCount = Cache.spanQueue.length
    if (Cache.spanArr.length == 0 && spanCount >= 2) {
      // 队列出队，进入处理池
      for (i = 0; i < spanCount; i++) {
        Cache.spanArr.push(Cache.spanQueue.shift())
      }
      // 使用处理池内的数据生成报告
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