const config = require('config')
const RPCServer = require('x-grpc').RPCServer

new RPCServer(config.grpc).run()
console.info(`NodeTracing服务节点启动【执行环境:${process.env.NODE_ENV},端口:${config.grpc.port}】`)