const Cache = require('../cache/Cache.js')
// 路由相关
const Router = require('koa-router')
// 日志相关
// const log = require('tracer').colorConsole({ level: require('config').get('log').level })
// 初始化路由
const router = new Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * 登录
 */
router.post('/login', function (ctx, next) {
    let inparam = ctx.request.body
    if (Cache.username == inparam.username && bcrypt.compareSync(Cache.password, inparam.password)) {
        ctx.body = jwt.sign({ username: Cache.username, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) }, Cache.tokenkey)
    } else {
        ctx.body = false
    }
})

/**
 * 变更认证
 */
router.post('/updateAuth', function (ctx, next) {
    let inparam = ctx.request.body
    Cache.username = inparam.username
    Cache.password = inparam.password
    ctx.body = true
})

module.exports = router