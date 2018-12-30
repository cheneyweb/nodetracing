// const asyncHooks = require('async_hooks')
// const R = require('ramda')
// const fs = require('fs')
// const allHookMap = global.allHookMap
// const appHookMap = global.appHookMap
class Instrument {
    // static tracer = {}
    // static auto(tracer) {
    //     Instrument.tracer = tracer
    //     let allHookMap = Instrument.allHookMap = new Map()
    //     let appHookMap = Instrument.appHookMap = new Map()
    //     const hook = asyncHooks.createHook({
    //         init(asyncId, type, triggerAsyncId) {
    //             allHookMap.set(asyncId, triggerAsyncId)
    //             // fs.writeSync(1, `${type}(${asyncId})<=p${triggerAsyncId}\n`);
    //         },
    //         destroy(asyncId) {
    //             allHookMap.delete(asyncId)
    //         }
    //     })
    //     hook.enable()
    //     setTimeout(() => {
    //         console.log(allHookMap.size)
    //         console.log(appHookMap.size)
    //     }, 5000)
    //     return tracer
    // }
    // static autoSpan(triggerAsyncId, executionAsyncId, operationName) {
    //     let allHookMap = Instrument.allHookMap
    //     let appHookMap = Instrument.appHookMap
    //     let tracer = Instrument.tracer
    //     function getParent(parentId) {
    //         if (appHookMap.has(parentId)) {
    //             return appHookMap.get(parentId)
    //         } else if (allHookMap.has(parentId)) {
    //             return getParent(allHookMap.get(parentId))
    //         }
    //     }
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
    // static aop(func) {
    //     function before(args) {
    //         console.log(`before：${asyncHooks.executionAsyncId()}`)
    //         Instrument.autoSpan(asyncHooks.triggerAsyncId(), asyncHooks.executionAsyncId(), args.pop())
    //         return args
    //     }
    //     async function after(res) {
    //         let appHookMap = Instrument.appHookMap
    //         let id = asyncHooks.executionAsyncId()
    //         await res
    //         console.log(`after：${id}`)
    //         appHookMap.get(id).span.finish()
    //         // setTimeout(() => {
    //         appHookMap.delete(id)
    //         // }, 1000)
    //         return res
    //     }
    //     // for (let func of funcs) {
    //     //     let funcName = func.name
    //     //     func = R.pipe((...arg) => { arg.push(funcName); return arg }, before, R.apply(func), after)
    //     // }
    //     // return funcs
    //     // main = R.pipe((...arg) => { arg.push('main'); return arg }, before, R.apply(main), after)
    //     // phase1 = R.pipe((...arg) => { arg.push('phase1'); return arg }, before, R.apply(phase1), after)
    //     // phase2 = R.pipe((...arg) => { arg.push('phase2'); return arg }, before, R.apply(phase2), after)
    //     // phase3 = R.pipe((...arg) => { arg.push('phase3'); return arg }, before, R.apply(phase3), after)
    //     // phase4 = R.pipe((...arg) => { arg.push('phase4'); return arg }, before, R.apply(phase4), after)
    //     let funcName = func.name
    //     return func = R.pipe((...arg) => { arg.push(funcName); return arg }, before, R.apply(func), after)
    // }
}

module.exports = Instrument
