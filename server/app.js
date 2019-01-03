const config = require('config')
const RPCServer = require('x-grpc').RPCServer

// Span收集服务
const rpcServer = new RPCServer(config.grpc)
rpcServer.listen()
console.info(`NodeTracing服务节点启动【执行环境:${process.env.NODE_ENV},端口:${config.grpc.port}】`)

// 系统配置参数
const port = config.server.port												// 系统端口
const staticRoot = config.server.staticRoot									// 静态根目录
// 应用服务相关
const Koa = require('koa')													// KOA应用框架
const cors = require('@koa/cors')                                           // 跨域中间件
const koaBody = require('koa-body')								            // 入参JSON解析中间件
const staticServer = require('koa-static')									// 静态资源服务中间件
const mount = require('koa-mount')											// 挂载点中间件
// 应用中间件
const xcontroller = require('koa-xcontroller')								// koa-xcontroller，自动路由中间件

// 初始化应用服务
const app = new Koa()
// 启用静态资源服务
app.use(mount(staticRoot, staticServer(`${__dirname}/web`)))
app.use(mount('/', cors()))
app.use(koaBody())

// 1,加载koa-xcontroller中间件
xcontroller.init(app, config.server)                                        // 应用实例，可选配置：访问根路径，控制器目录路径

app.listen(port)
console.info(`NodeTracing-WebUI启动【执行环境:${process.env.NODE_ENV},端口:${port}】`)
console.warn(`静态资源访问路径【localhost:${port}${staticRoot}*】`)
console.warn(`RESTful  API路径【localhost:${port}${config.server.controllerRoot}/MODULE_NAME/*】`)