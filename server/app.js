const RPCServer = require('x-grpc').RPCServer
const RPC_PORT = +process.env.RPC_PORT || 50051
const WEB_PORT = +process.env.WEB_PORT
// Span收集服务节点
const rpcServer = new RPCServer({ port: RPC_PORT, protosDir: "/src/protos/", implsDir: "/src/impls/" })
rpcServer.listen()
console.info(`NodeTracing-RPC服务节点启动【端口：${RPC_PORT}】`)

// WebUI应用服务
if (WEB_PORT) {
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
    console.warn(`NodeTracing-API接口服务启动【路径：localhost:${WEB_PORT}/nodetracing/MODULE_NAME/*】`)
}