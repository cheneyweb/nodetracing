const Cache = require('../cache/Cache.js')
const LevelDB = require('../cache/LevelDB.js')
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
router.get('/tracer/:spanId', async (ctx, next) => {
    let serviceArr = Array.from(Cache.serviceSet)
    let spanArrRes = await LevelDB.queryByPrefix(ctx.params.spanId)
    let spans = _.orderBy(spanArrRes, ['depth', 'startMs'])
    let maxDepthSpan = _.maxBy(spanArrRes, 'depth')
    let depth = maxDepthSpan ? maxDepthSpan.depth : 0
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
    ctx.body = { depth, serviceArr, spanArr }
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