const Cache = require('../cache/Cache.js')
// 路由相关
const Router = require('koa-router')
// 日志相关
// const log = require('tracer').colorConsole({ level: require('config').get('log').level })
// 初始化路由
const router = new Router()
// 工具相关
const _ = require('lodash')
/**
 * 跟踪根Span
 */
router.get('/tracer/:spanId', function (ctx, next) {
    let serviceArr = Array.from(Cache.serviceSet)
    let depth = Cache.spanTracerMap[ctx.params.spanId].depth
    let spans = _.orderBy(Cache.spanTracerMap[ctx.params.spanId].spanArr, ['depth', 'startMs'])
    let spanArr = []
    for (let span of spans) {
        spanArr.push({
            id: span.id,
            operationName: span.operationName,
            startMs: span.startMs,
            finishMs: span.finishMs,
            durationMs: span.durationMs,
            serviceName: span.serviceName
        })
    }
    ctx.body = { depth, serviceArr, spanArr: spanArr }
})

// 递归根span所有关系
// function getRefSpan(spanArr, span) {
//     for (reference of span.references) {
//         let refSpan = reference.referencedContext.span
//         spanArr.push({
//             id: refSpan.id,
//             operationName: refSpan.operationName,
//             startMs: refSpan.startMs,
//             finishMs: refSpan.finishMs,
//             duration: refSpan.duration,
//             serviceName: refSpan.tracer.serviceName
//         })
//         getRefSpan(spanArr, refSpan)
//     }
// }

module.exports = router