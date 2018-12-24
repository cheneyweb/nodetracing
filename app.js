const nodetracing = require('./src/index.js')

async function main() {
    console.log('nodetracing自动探针启动...')
    const tracer = new nodetracing.Tracer()

    let parentSpan = tracer.startSpan('parent_span')
    parentSpan.setTag('category', '根')

    await waitASecond(1000)

    let childSpan = tracer.startSpan('child_span', { childOf: parentSpan })
    childSpan.setTag('category', '注册')
    childSpan.log({ event: 'waiting' })
    
    await waitASecond(500)

    childSpan.log({ event: 'done' })
    childSpan.finish()
    parentSpan.finish()

    // baseReport(tracer)
    echartReport(tracer)
}
// 基础报告
function baseReport(tracer) {
    // 生成报告
    let report = tracer.report('Report')
    // 报告所有span
    for (let span of report.spans) {
        console.log(`${span.operationName()}-${span.durationMs()}ms`)
        let tags = span.tags()
        // 标签
        for (let key in tags) {
            console.log(`\ttag:{${key}:${tags[key]}}`)
        }
        // 日志
        for (let log of span.logs()) {
            console.log(`\tlog:${log.fields.event},${log.timestamp}`)
        }
        // 关联
        for (let reference of span.references()) {
            console.log(`\t${reference.type()}:${reference.referencedContext().span().operationName()}`)
        }
    }
}
// echart报告
function echartReport(tracer) {
    let report = tracer.report('EchartReport')
    console.log(JSON.stringify(report.dag()))
}

function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}

main()