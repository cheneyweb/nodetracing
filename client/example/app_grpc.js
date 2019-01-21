// const nodetracing = require('nodetracing')
const nodetracing = require('../nodetracing_modules/nodetracing/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'Grpc', rpcAddress: 'localhost', rpcPort: '36361', auto: true, stackLog: false, maxDuration: 30000 })
const RPCServer = require('x-grpc').RPCServer
const server = new RPCServer({ port: 3333, protosDir: "/example/grpc/protos/", implsDir: "/example/grpc/impls/", serverAddress: "localhost" })

// ==========切面中间件==========
server.use(nodetracing.grpcServerMiddleware())
// ==========切面中间件==========

server.listen()
console.info('grpc模拟服务启动端口：3333')