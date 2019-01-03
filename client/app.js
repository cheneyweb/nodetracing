// ==========自动探针==========
// const nodetracing = require('nodetracing')
const nodetracing = require('./nodetracing_modules/nodetracing/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'S1', serverAddress: 'localhost', auto: true, stackLog: false, maxDuration: 5000 })
// async自动探针
main = nodetracing.aop(main)
phase1 = nodetracing.aop(phase1)
phase2 = nodetracing.aop(phase2)
phase3 = nodetracing.aop(phase3)
phase4 = nodetracing.aop(phase4)
// http请求自动探针（axios）
const axios = require('axios')
axios.interceptors.request.use(nodetracing.axiosMiddleware())
// grpc自动探针
const RPCClient = require('x-grpc').RPCClient
const rpc = new RPCClient({
    port: 3333,
    protosDir: "/grpc/protos/",
    implsDir: "/grpc/impls/",
    serverAddress: "localhost"
})
rpc.use(nodetracing.grpcClientMiddleware())
// ==========自动探针==========

const appLocal = require('./app_local.js')

async function main() {
    await waitASecond(500)
    await phase1()
    await phase2()

    await axios.get('http://localhost:1111/express')

    phase3()
    return 'mainres'
}
async function phase1() {
    await waitASecond(100)
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

main()
// let headers = { custom: 123 }
// axios.get('http://localhost:1111/hello', { headers })

// const R = require('ramda')
// const fs = require('fs')
// const allHookMap = new Map()
// const appHookMap = new Map()

// const asyncHooks = require('async_hooks')
// const hook = asyncHooks.createHook({
//     init(asyncId, type, triggerAsyncId) {
//         allHookMap.set(asyncId, triggerAsyncId)
//         // fs.writeSync(1, `${type}(${asyncId})<=p${triggerAsyncId}\n`);
//     },
//     destroy(asyncId) {
//         allHookMap.delete(asyncId)
//     }
// })
// hook.enable()
// // ==========上下文关系处理==========
// function autoSpan(triggerAsyncId, executionAsyncId, operationName) {
//     let context = { parentId: triggerAsyncId, id: executionAsyncId, operationName }
//     let parent = getParent(triggerAsyncId)
//     // 非根Span
//     if (parent) {
//         context.parent = parent
//         context.parentId = context.parent.id
//         context.span = tracer.startSpan(operationName, { childOf: parent.span })
//     }
//     // 根Span
//     else {
//         context.span = tracer.startSpan(operationName)
//     }
//     // context.span.setTag('category', '自定义标签')
//     // context.span.log({ event: '自定义日志事件' })
//     // 存储上下文
//     appHookMap.set(executionAsyncId, context)
//     return context.span
// }
// function getParent(parentId) {
//     if (appHookMap.has(parentId)) {
//         return appHookMap.get(parentId)
//     } else /*if (allHookMap.has(parentId))*/ {
//         return getParent(allHookMap.get(parentId))
//     }
// }
// // ==========上下文关系处理==========

// // ==========AOP==========
// function before(args) {
//     console.log(`before：${asyncHooks.executionAsyncId()}`)
//     autoSpan(asyncHooks.triggerAsyncId(), asyncHooks.executionAsyncId(), args.pop())
//     return args
// }
// async function after(res) {
//     let id = asyncHooks.executionAsyncId()
//     await res
//     console.log(`after：${id}`)
//     appHookMap.get(id).span.finish()
//     // setTimeout(() => {
//     appHookMap.delete(id)
//     // }, 1000)
//     return res
// }
// main = R.pipe((...arg) => { arg.push('main'); return arg }, before, R.apply(main), after)
// phase1 = R.pipe((...arg) => { arg.push('phase1'); return arg }, before, R.apply(phase1), after)
// phase2 = R.pipe((...arg) => { arg.push('phase2'); return arg }, before, R.apply(phase2), after)
// phase3 = R.pipe((...arg) => { arg.push('phase3'); return arg }, before, R.apply(phase3), after)
// phase4 = R.pipe((...arg) => { arg.push('phase4'); return arg }, before, R.apply(phase4), after)
// // ==========AOP==========
// setTimeout(() => {
//     console.log(allHookMap.size)
//     console.log(appHookMap.size)
// }, 10000)