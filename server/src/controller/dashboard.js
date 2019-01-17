const Cache = require('../cache/Cache.js')
const LevelDB = require('../cache/LevelDB.js')
// 路由相关
const Router = require('koa-router')
// 日志相关
// const log = require('tracer').colorConsole({ level: require('config').get('log').level })
// 初始化路由
const router = new Router()

/**
 * 获取所有统计数据
 */
router.get('/count', async (ctx, next) => {
    let data = {
        serviceCount: Cache.serviceSet.size,
        operationCount: 0,
        clusterCount: 0,
        durationAvg: 0
    }
    let pArr = []
    let durationCount = 0
    let durationSum = 0
    for (let service of Cache.serviceSet) {
        let operationArr = await LevelDB.queryByPrefix(`${LevelDB.PREFIX_SERVICE_OPERATION}${service}`)
        data.operationCount += operationArr.length
        for (let operation of operationArr) {
            pArr.push(LevelDB.queryByPrefix(`${LevelDB.PREFIX_SERVICE_OPERATION_SPAN}${service}.${operation}`, 20))
        }
    }
    let resArr = await Promise.all(pArr)
    for (let arr of resArr) {
        for (let span of arr) {
            durationSum += span.durationMs
            durationCount++
        }
    }
    data.durationAvg = parseFloat((durationSum / durationCount).toFixed(2))
    ctx.body = data
})

/**
 * 获取单服务平均时延
 */
router.get('/service/:serviceName', async (ctx, next) => {
    // ctx.body = Cache.serviceMap[ctx.params.serviceName].spanDAG
})

/**
 * 获取单操作平均时延
 */
router.get('/operation/:spanId', async (ctx, next) => {
    // ctx.body = Cache.serviceMap[ctx.params.serviceName].spanDAG
})

module.exports = router