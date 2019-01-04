// ==========自动探针==========
// const nodetracing = require('nodetracing')
const nodetracing = require('../nodetracing_modules/nodetracing/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'S1', rpcAddress: 'localhost', rpcPort: '36361', auto: true, stackLog: false, maxDuration: 30000 })
// async自动探针
main = nodetracing.aop(main)
phase1 = nodetracing.aop(phase1)
phase2 = nodetracing.aop(phase2)
phase3 = nodetracing.aop(phase3)
phase4 = nodetracing.aop(phase4)
// http请求自动探针
const axios = require('axios')
axios.interceptors.request.use(nodetracing.axiosMiddleware())
// grpc自动探针
const RPCClient = require('x-grpc').RPCClient
const rpc = new RPCClient({ port: 3333, protosDir: "/example/grpc/protos/", implsDir: "/example/grpc/impls/", serverAddress: "localhost" })
rpc.use(nodetracing.grpcClientMiddleware())
// ==========自动探针==========
const appLocal = require('./app_local')

// 模拟服务调用链
async function main() {
    await waitASecond(500)
    await phase1()
    await phase2()
    phase3()
    return 'mainres'
}
async function phase1() {
    await waitASecond(100)
    await axios.get('http://localhost:1111/express')
}
async function phase2() {
    await axios.get('http://localhost:2222/koa')
    await waitASecond(100)
}
async function phase3() {
    await appLocal()
    await rpc.connect()
    await rpc.invoke('demo.User.login', { username: 'cheney', password: '123456' })
    phase4()
}
async function phase4() {
    await waitASecond(200)
}

// 模拟函数执行等待
function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}

// 开始调用
main()
