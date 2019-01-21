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
 * 获取单服务所有Operation
 */
router.get('/:serviceName', async (ctx, next) => {
    let operationArr = await LevelDB.queryByPrefix(`${LevelDB.PREFIX_SERVICE_OPERATION}${ctx.params.serviceName}`)
    ctx.body = operationArr
})

/**
 * 获取单Operation所有根Span
 */
router.get('/:serviceName/:operationName', async (ctx, next) => {
    let rootSpanArr = []
    let rootSpanArrRes = await LevelDB.queryByPrefix(`${LevelDB.PREFIX_SERVICE_OPERATION_SPAN}${ctx.params.serviceName}.${ctx.params.operationName}`, 20)
    let maxDurationMsSpan = _.maxBy(rootSpanArrRes, 'durationMs')
    for (let rootSpan of rootSpanArrRes) {
        rootSpanArr.push({
            id: rootSpan.id,
            operationName: rootSpan.operationName,
            startMs: rootSpan.startMs,
            duration: rootSpan.durationMs,
            percent: parseInt(rootSpan.durationMs / maxDurationMsSpan.durationMs * 100)
        })
    }
    ctx.body = rootSpanArr
})

module.exports = router