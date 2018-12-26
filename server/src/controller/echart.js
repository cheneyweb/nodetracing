const Cache = require('../cache/Cache.js')
// 路由相关
const Router = require('koa-router')
// 日志相关
// const log = require('tracer').colorConsole({ level: require('config').get('log').level })
// 初始化路由
const router = new Router()

/**
 * 获取所有服务节点有向无环图
 */
router.get('/dag', function (ctx, next) {
    ctx.body = Cache.serviceDAG
})

/**
 * 获取单服务Span有向无环图
 */
router.get('/dag/:serviceName', function (ctx, next) {
    ctx.body = Cache.serviceMap[ctx.params.serviceName].spanDAG
})

/**
 * 获取单服务所有Span线
 */
router.get('/operation/:serviceName/:operationName', function (ctx, next) {
    let rootSpanArr = []
    for (let rootSpan of Cache.serviceMap[ctx.params.serviceName].rootSpanMap[ctx.params.operationName]) {
        rootSpanArr.push({
            operationName: rootSpan.operationName,
            duration: rootSpan.finishMs - rootSpan.startMs
        })
    }

    ctx.body = rootSpanArr
})

module.exports = router