const nodetracing = require('nodetracing')
// const nodetracing = require('./nodetracing_modules/nodetracing/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'Grpc', rpcAddress: 'localhost', auto: true, stackLog: false, maxDuration: 5000 })
const RPCServer = require('x-grpc').RPCServer
const server = new RPCServer({
    port: 3333,
    protosDir: "/grpc/protos/",
    implsDir: "/grpc/impls/",
    serverAddress: "localhost"
})

// ==========切面中间件==========
server.use(nodetracing.grpcServerMiddleware())
// ==========切面中间件==========

server.listen()
console.info('grpc模拟服务启动端口：3333')