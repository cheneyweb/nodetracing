const nodetracing = require('./src/index.js')

console.log('nodetracing自动探针启动...')

const tracer = new nodetracing.Tracer()
let parent = tracer.startSpan('parent_span')
parent.setTag('customTag', 'customValue')
parent.setTag('alpha', '1000')
setTimeout(() => {
    let child = tracer.startSpan('child_span', { childOf: parent })
    child.setTag('alpha', '200')
    child.setTag('beta', '50')
    child.log({ event: 'waiting' })
    setTimeout(() => {
        child.log({ event: 'done' })
        child.finish()
        parent.finish()
        // 生成报告
        let report = tracer.report()
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
    }, 500)
}, 1000)

// function spanReference(span) {
//     // 处理span所有关系
//     for (let reference of span.references()) {
//         switch (reference.type()) {
//             // case nodetracing.REFERENCE_CHILD_OF:
//             //     break;
//             // case nodetracing.REFERENCE_FOLLOWS_FROM:
//             //     break;
//             default:
//                 let refSpan = reference.span()
//                 break;
//         }
//         console.log()
//     }
// }