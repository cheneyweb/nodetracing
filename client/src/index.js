const asyncHooks = require('async_hooks')
const R = require('ramda')
const opentracing = require('opentracing')

const Tracer = require('./Tracer.js')
const Span = require('./Span.js')
const SpanContext = require('./SpanContext.js')
// const Instrument = require('./Instrument.js')

// 自动Span
function autoSpan(triggerAsyncId, executionAsyncId, operationName) {
    let tracer = global.tracer
    let allHookMap = global.allHookMap
    let appHookMap = global.appHookMap
    function getParent(parentId) {
        if (appHookMap.has(parentId)) {
            return appHookMap.get(parentId)
        } else if (allHookMap.has(parentId)) {
            return getParent(allHookMap.get(parentId))
        }
    }
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
// 切面注入
function aop(func) {
    // if (func.constructor.name != 'AsyncFunction') {
    //     console.error(`only work with async function! ${func.name} isn't an async function`)
    //     return func
    // }
    let appHookMap = global.appHookMap
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
        // setTimeout(() => {
        appHookMap.delete(id)
        // }, 1000)
        return res
    }
    // for (let func of funcs) {
    //     let funcName = func.name
    //     func = R.pipe((...arg) => { arg.push(funcName); return arg }, before, R.apply(func), after)
    // }
    // return funcs
    // main = R.pipe((...arg) => { arg.push('main'); return arg }, before, R.apply(main), after)
    // phase1 = R.pipe((...arg) => { arg.push('phase1'); return arg }, before, R.apply(phase1), after)
    // phase2 = R.pipe((...arg) => { arg.push('phase2'); return arg }, before, R.apply(phase2), after)
    // phase3 = R.pipe((...arg) => { arg.push('phase3'); return arg }, before, R.apply(phase3), after)
    // phase4 = R.pipe((...arg) => { arg.push('phase4'); return arg }, before, R.apply(phase4), after)
    let funcName = func.name
    return func = R.pipe((...arg) => { arg.push(funcName); return arg }, before, R.apply(func), after)
}

module.exports = { ...opentracing, Tracer, Span, SpanContext, aop }