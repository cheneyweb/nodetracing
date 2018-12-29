const nodetracing = require('./src/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'S1' })

const R = require('ramda')
const axios = require('axios')
const fs = require('fs')
const allHookMap = new Map()
const appHookMap = new Map()
// const Context = {
//     init(asyncId, type, triggerAsyncId) {
//         if (context.has(triggerAsyncId)) {
//             context.set(asyncId, context.get(triggerAsyncId));
//         }
//     },
//     destroy(asyncId) {
//         if (context.has(asyncId)) {
//             context.delete(asyncId);
//         }
//     }
// }

const asyncHooks = require('async_hooks')
const hook = asyncHooks.createHook({
    init(asyncId, type, triggerAsyncId) {
        // fs.writeSync(1, `size：${allHookMap.size}\n`)
        allHookMap.set(asyncId, triggerAsyncId)
        // fs.writeSync(1, `${type}(${triggerAsyncId})=>${asyncId}\n`);
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
    // autoSpan(asyncHooks.executionAsyncId(), asyncHooks.triggerAsyncId(), 'main')
    let parentSpan = tracer.startSpan('ps')
    parentSpan.setTag('category', '根')
    await waitASecond(100)

    await phase1(parentSpan)

    parentSpan2 = await phase2(parentSpan)

    const headers = tracer.inject(parentSpan2, nodetracing.FORMAT_HTTP_HEADERS, {})
    await axios.get('http://localhost:1111/hello', { headers })

    phase3(parentSpan2)

    parentSpan.finish()
    return 'asd'
}

async function phase1(parentSpan) {
    // autoSpan(asyncHooks.executionAsyncId(), asyncHooks.triggerAsyncId(), 'phase1')

    let childSpan = tracer.startSpan('cs1-1', { childOf: parentSpan })
    childSpan.setTag('category', '注册1')
    childSpan.log({ event: 'waiting' })
    await waitASecond(200)
    childSpan.log({ event: 'done' })
    childSpan.finish()
    return childSpan
}

async function phase2(parentSpan) {
    // autoSpan(asyncHooks.executionAsyncId(), asyncHooks.triggerAsyncId(), 'phase2')

    let childSpan = tracer.startSpan('cs1-2', { childOf: parentSpan })
    childSpan.setTag('category', '注册2')
    childSpan.log({ event: 'waiting' })
    await waitASecond(300)
    childSpan.log({ event: 'done' })
    childSpan.finish()
    return childSpan
}

async function phase3(parentSpan) {
    // autoSpan(asyncHooks.executionAsyncId(), asyncHooks.triggerAsyncId(), 'phase3')

    let childSpan = tracer.startSpan('cs2', { childOf: parentSpan })
    childSpan.setTag('category', '注册3')
    childSpan.log({ event: 'waiting' })
    await waitASecond(400)
    childSpan.log({ event: 'done' })

    phase4()

    childSpan.finish()
    return childSpan
}

async function phase4(parentSpan) {
    // autoSpan(asyncHooks.executionAsyncId(), asyncHooks.triggerAsyncId(), 'phase4')
}

function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}

// ==========自动生成span==========
function autoSpan(triggerAsyncId, executionAsyncId, context) {
    appHookMap.set(executionAsyncId, { parentId: triggerAsyncId, id: executionAsyncId, context })
}
// ==========自动生成span==========

// ==========每2秒收集处理一次span关系==========
setInterval(() => {
    tracerRelation()
    console.log(appHookMap)
    // allHookMap.clear()
    // appHookMap.clear()
}, 2000)

// 追踪所有span关系
function tracerRelation() {
    for (let hook of appHookMap.values()) {
        hook.parent = getParent(hook.parentId)
        console.log(hook.parent)
        hook.parentId = hook.parent ? hook.parent.id : null
    }
}
// 查找父亲
function getParent(parentId) {
    if (appHookMap.has(parentId)) {
        return appHookMap.get(parentId)
    } else if (allHookMap.has(parentId)) {
        return getParent(allHookMap.get(parentId))
    }
}
// ==========每2秒收集处理一次span关系==========


// ==========AOP==========
let before = (args) => {
    console.log(`before`)
    // console.log(asyncHooks.executionAsyncId())
    // console.log(asyncHooks.triggerAsyncId())
    autoSpan(asyncHooks.triggerAsyncId(), asyncHooks.executionAsyncId(), args.pop())
    return args
}
let after = (res) => {
    console.log(`after`)
    return res
}
main = R.pipe((...arg) => { arg.push('main'); return arg }, before, R.apply(main), after)
phase1 = R.pipe((...arg) => { arg.push('phase1'); return arg }, before, R.apply(phase1), after)
phase2 = R.pipe((...arg) => { arg.push('phase2'); return arg }, before, R.apply(phase2), after)
phase3 = R.pipe((...arg) => { arg.push('phase3'); return arg }, before, R.apply(phase3), after)
phase4 = R.pipe((...arg) => { arg.push('phase4'); return arg }, before, R.apply(phase4), after)
// ==========AOP==========

// setInterval(async () => {
//     main()
// }, 5000)
main()
