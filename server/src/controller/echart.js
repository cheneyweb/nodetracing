const Cache = require('../cache/Cache.js')
// 路由相关
const Router = require('koa-router')
// 日志相关
// const log = require('tracer').colorConsole({ level: require('config').get('log').level })
// 初始化路由
const router = new Router()
/**
 * 获取有向无环图
 */
router.get('/dag', function (ctx, next) {
    ctx.body = Cache.echarDAG
})

module.exports = router