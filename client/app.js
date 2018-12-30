const nodetracing = require('./src/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'S1' })

const R = require('ramda')
const axios = require('axios')
const fs = require('fs')
const allHookMap = new Map()
const appHookMap = new Map()

const asyncHooks = require('async_hooks')
const hook = asyncHooks.createHook({
    init(asyncId, type, triggerAsyncId) {
        // fs.writeSync(1, `size：${allHookMap.size}\n`)
        allHookMap.set(asyncId, triggerAsyncId)
        fs.writeSync(1, `${type}(${triggerAsyncId})=>${asyncId}\n`);
    },
    destroy(asyncId) {
    }
})
hook.enable()

// axios.interceptors.request.use(config => {
//     // console.log(config.method)
//     // console.log(config.url)
//     // console.log(asyncHooks.triggerAsyncId())
//     // console.log(asyncHooks.executionAsyncId())
//     // Context.context.set(asyncHooks.executionAsyncId(), config);
//     if (spanContext) {
//         config.headers.nodetracing = `${spanContext}`;
//     }
//     return config;
// }, err => {
//     return Promise.reject(err);
// });

async function main() {
    await waitASecond(100)

    await phase1()

    await phase2()

    // TODO 未来RPC远程调用也需要自动探针注入，尚未实现
    // const headers = tracer.inject(parentSpan2, nodetracing.FORMAT_HTTP_HEADERS, {})
    // await axios.get('http://localhost:1111/hello', { headers })

    phase3()

    return 'mainres'
}

async function phase1() {
    await waitASecond(200)
}

async function phase2() {
    await waitASecond(300)
}

async function phase3() {
    await waitASecond(400)
    phase4()
}

async function phase4() {
    await waitASecond(100)
}

// 模拟函数执行等待
function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}

// ==========上下文关系处理==========
function autoSpan(triggerAsyncId, executionAsyncId, operationName) {
    let context = { parentId: triggerAsyncId, id: executionAsyncId, operationName }
    let parent = getParent(triggerAsyncId)
    // 非根Span
    if (parent) {
        context.parent = parent
        context.parentId = context.parent.id
        context.span = tracer.startSpan(operationName, { childOf: parent.span })
    }
    // 根Span
    else {
        context.span = tracer.startSpan(operationName)
    }
    // context.span.setTag('category', '自定义标签')
    // context.span.log({ event: '自定义日志事件' })
    // 存储上下文
    appHookMap.set(executionAsyncId, context)
    return context.span
}
function getParent(parentId) {
    if (appHookMap.has(parentId)) {
        return appHookMap.get(parentId)
    } else if (allHookMap.has(parentId)) {
        return getParent(allHookMap.get(parentId))
    }
}
// ==========上下文关系处理==========

// ==========AOP==========
function before(args) {
    console.log(`before：${asyncHooks.executionAsyncId()}`)
    autoSpan(asyncHooks.triggerAsyncId(), asyncHooks.executionAsyncId(), args.pop())
    return args
}
async function after(res) {
    let id = asyncHooks.executionAsyncId()
    await res
    console.log(`after：${id}`)
    appHookMap.get(id).span.finish()
    return res
}
main = R.pipe((...arg) => { arg.push('main'); return arg }, before, R.apply(main), after)
phase1 = R.pipe((...arg) => { arg.push('phase1'); return arg }, before, R.apply(phase1), after)
phase2 = R.pipe((...arg) => { arg.push('phase2'); return arg }, before, R.apply(phase2), after)
phase3 = R.pipe((...arg) => { arg.push('phase3'); return arg }, before, R.apply(phase3), after)
phase4 = R.pipe((...arg) => { arg.push('phase4'); return arg }, before, R.apply(phase4), after)
// ==========AOP==========

setTimeout(async () => {
    await main()
}, 2000)
// main()