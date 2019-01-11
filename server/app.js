const RPCServer = require('x-grpc').RPCServer
const RPCClient = require('x-grpc').RPCClient
const LevelDB = require('./src/cache/LevelDB.js')
const Cache = require('./src/cache/Cache.js')
const CollectReport = require('./src/report/CollectReport.js')
const RPC_PORT = +process.env.RPC_PORT || 36361
const WEB_PORT = +process.env.WEB_PORT
const REPORT_ADDR = process.env.REPORT_ADDR
const REPORT_INTERVAL = process.env.REPORT_INTERVAL || 5000
const USERNAME = process.env.USERNAME || 'admin'
const PASSWORD = process.env.PASSWORD || '123456'

// WebUI应用服务
if (WEB_PORT) {
    // 启动上报服务
    const reportServer = new RPCServer({ port: 36362, protosDir: '/src/protos/', implsDir: '/src/impls/' })
    reportServer.listen()
    console.info('NodeTracing-Report服务已启动【端口：36362】')

    // 启动WEB服务
    const staticRoot = '/nodetracing/web/'									    // web服务根目录
    const Koa = require('koa')													// KOA应用框架
    const cors = require('@koa/cors')                                           // 跨域中间件
    const koaBody = require('koa-body')								            // 入参JSON解析中间件
    const staticServer = require('koa-static')									// 静态资源服务中间件
    const mount = require('koa-mount')											// 挂载点中间件
    // 应用中间件
    const xcontroller = require('koa-xcontroller')								// 自动路由中间件
    // 初始化应用服务
    const app = new Koa()
    // 启用静态资源服务
    app.use(mount(staticRoot, staticServer(`${__dirname}/web`)))
    app.use(mount('/', cors()))
    app.use(koaBody())
    // koa-xcontroller中间件
    xcontroller.init(app, { controllerRoot: '/nodetracing', controllerDir: '/src/controller/' })
    app.listen(WEB_PORT)
    console.info(`NodeTracing-WEB应用服务启动【访问：http://localhost:${WEB_PORT}/nodetracing/web/index.html】`)
    console.warn(`NodeTracing-API接口服务启动【路径：localhost:${WEB_PORT}/nodetracing/MODULE_NAME/*】\n`)

    // 载入帐号密码
    Cache.username = USERNAME
    Cache.password = PASSWORD
    // 启动持久化
    LevelDB.init('_db')
    // 缓存数据加载-服务集合
    LevelDB.queryByPrefix(LevelDB.PREFIX_SERVICE_SET).then((resArr) => {
        Cache.serviceSet = new Set(resArr)
        console.info(`\nNodeTracing-WEB数据加载【服务集合】`)
    })
    // 缓存数据加载-服务拓扑
    LevelDB.queryByPrefix(LevelDB.PREFIX_SERVICE_DAG).then((resArr) => {
        Cache.serviceDAG = resArr[0] || { data: [], links: [], categories: [], legend: { data: [] } }
        console.info(`NodeTracing-WEB数据加载【服务拓扑】`)
    })
    // 缓存数据加载-服务图集
    LevelDB.queryByPrefix(LevelDB.PREFIX_SERVICE_MAP).then((resArr) => {
        for (let res of resArr) {
            Cache.serviceMap[res.serviceName] = { serviceName: res.serviceName, spanSet: new Set(res.spanSet), spanDAG: res.spanDAG }
        }
        console.info(`NodeTracing-WEB数据加载【服务图集】`)
    })
}

// 追踪服务
if (REPORT_ADDR) {
    // Span收集服务节点
    const rpcServer = new RPCServer({ port: RPC_PORT, protosDir: '/src/protos/', implsDir: '/src/impls/' })
    rpcServer.listen()
    console.info(`NodeTracing-RPC服务节点启动【端口：${RPC_PORT}】`)
    // 连接上报服务
    new RPCClient({ port: 36362, protosDir: '/src/protos/', serverAddress: REPORT_ADDR }).connect().then((reportRPC) => {
        global.reportRPC = reportRPC
        console.info(`NodeTracing-Report服务已连接【${REPORT_ADDR}:36362】`)
    })
    // 定时上报
    setInterval(async () => {
        // 队列有数据，且处理池为空，生成报告上报
        let spanCount = Cache.spanQueue.length
        if (spanCount > 0 && Cache.spanArr.length == 0) {
            let time1 = Date.now()
            // 出列
            for (i = 0; i < spanCount; i++) {
                Cache.spanArr.push(Cache.spanQueue.shift())
            }
            // 上报
            await new CollectReport(Cache.spanArr).report()
            // 清空
            Cache.spanArr = []
            console.log(`单次上报用时：${Date.now() - time1}ms`)
        }
    }, Math.ceil(Math.random() * REPORT_INTERVAL))
}