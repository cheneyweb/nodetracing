const asyncHooks = require('async_hooks')
const R = require('ramda')
/**
 * 自动探针
 */
class Instrument {
    // 自动Span
    static autoSpan(triggerAsyncId, executionAsyncId, operationName) {
        let tracer = Instrument.tracer
        let allHookMap = Instrument.allHookMap
        // 获取父级上下文
        function getParent(parentId) {
            let parentContext = allHookMap.get(parentId)
            if (parentContext) {
                return parentContext.span ? parentContext : getParent(parentContext.parentId)
            }
        }
        let parent = getParent(triggerAsyncId)
        // 获取当前上下文
        let context = allHookMap.get(executionAsyncId)
        context.operationName = operationName
        // 非根Span
        if (parent) {
            context.parentId = parent.id
            context.parent = parent
            context.span = tracer.startSpan(operationName, { childOf: parent.span })
        }
        // 根Span
        else {
            context.span = tracer.startSpan(operationName)
        }
        // context.span.setTag('category', '自定义标签')
        // context.span.log({ event: '自定义日志事件' })
        return context.span
    }
    // 切面注入
    static aop(func) {
        if (func.constructor.name != 'AsyncFunction') {
            console.error(`only work with async function! ${func.name} isn't an async function`)
            return func
        }
        // 前置AOP
        function before(args) {
            let operationName = args.pop()
            console.log(`before ${operationName}：${asyncHooks.executionAsyncId()}`)
            Instrument.autoSpan(asyncHooks.triggerAsyncId(), asyncHooks.executionAsyncId(), operationName)
            return args
        }
        // 后置AOP
        async function afterAsync(res) {
            let allHookMap = Instrument.allHookMap
            let id = asyncHooks.executionAsyncId()
            await res
            let context = allHookMap.get(id)
            console.log(`after ${context.operationName}：${context.id}`)
            context.span.finish()
            return res
        }
        function after(res) {
            let allHookMap = Instrument.allHookMap
            let context = allHookMap.get(asyncHooks.executionAsyncId())
            console.log(`after ${context.operationName}：${context.id}`)
            context.span.finish()
            return res
        }
        // 合并AOP
        let funcName = func.name
        if (func.constructor.name == 'AsyncFunction') {
            return func = R.pipe((...arg) => { arg.push(funcName); return arg }, before, R.apply(func), afterAsync)
        } else {
            return func = R.pipe((...arg) => { arg.push(funcName); return arg }, before, R.apply(func), after)
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
    }
}

module.exports = Instrument
