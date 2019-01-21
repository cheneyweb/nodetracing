const Cache = require('../cache/Cache.js')
// 路由相关
const Router = require('koa-router')
// 日志相关
// const log = require('tracer').colorConsole({ level: require('config').get('log').level })
// 初始化路由
const router = new Router()

/**
 * 获取所有服务
 */
router.get('/', function (ctx, next) {
    ctx.body = Array.from(Cache.serviceSet).sort()
})

module.exports = router