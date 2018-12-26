const Cache = require('../cache/Cache.js')
// 路由相关
const Router = require('koa-router')
// 日志相关
// const log = require('tracer').colorConsole({ level: require('config').get('log').level })
// 初始化路由
const router = new Router()

/**
 * 获取单服务所有Operation
 */
router.get('/:serviceName', function (ctx, next) {
    let operationArr = []
    for (let key in Cache.serviceMap[ctx.params.serviceName].rootSpanMap) {
        operationArr.push(key)
    }
    ctx.body = operationArr
})

/**
 * 获取单Operation所有根Span
 */
router.get('/:serviceName/:operationName', function (ctx, next) {
    let rootSpanArr = []
    for (let rootSpan of Cache.serviceMap[ctx.params.serviceName].rootSpanMap[ctx.params.operationName]) {
        rootSpanArr.push({
            uuid: rootSpan.uuid,
            operationName: rootSpan.operationName,
            duration: rootSpan.finishMs - rootSpan.startMs
        })
    }
    ctx.body = rootSpanArr
})

module.exports = router