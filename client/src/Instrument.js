const asyncHooks = require('async_hooks')
const R = require('ramda')
const opentracing = require('opentracing')
/**
 * 自动探针
 */
class Instrument {
    // 自动Span
    static autoSpan(triggerAsyncId, executionAsyncId, operationName) {
        let tracer = Instrument.tracer
        let contextMap = Instrument.contextMap
        let context = contextMap.get(executionAsyncId)
        // 获取父级上下文
        function getParent(parentId) {
            let parentContext = contextMap.get(parentId)
            if (parentContext) {
                return parentContext.span ? { id: parentId, span: parentContext.span } : getParent(parentContext.parentId)
            }
        }
        let parent = getParent(triggerAsyncId)
        // 非根Span
        if (parent) {
            context.parentId = parent.id
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
            console.error(`【WARNING】only work with async function! ${func.name} isn't an async function`)
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
            let contextMap = Instrument.contextMap
            let context = contextMap.get(asyncHooks.executionAsyncId())
            let id = asyncHooks.executionAsyncId()
            await res
            console.log(`after ${context.span.operationName}：${id}`)
            context.span.finish()
            return res
        }
        function after(res) {
            let contextMap = Instrument.contextMap
            let context = contextMap.get(asyncHooks.executionAsyncId())
            let id = asyncHooks.executionAsyncId()
            console.log(`after ${context.operationName}：${id}`)
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
    }
    // 切面注入axios
    static aopAxios(axios) {
        let tracer = Instrument.tracer
        let contextMap = Instrument.contextMap
        // 获取父级上下文
        function getParent(parentId) {
            let parentContext = contextMap.get(parentId)
            if (parentContext) {
                return parentContext.span ? { id: parentId, span: parentContext.span } : getParent(parentContext.parentId)
            }
        }
        // axios请求拦截中间件
        axios.interceptors.request.use(config => {
            let parent = getParent(asyncHooks.triggerAsyncId())
            if (parent) {
                tracer.inject(parent.span, opentracing.FORMAT_HTTP_HEADERS, config.headers)
            }
            return config
        }, err => {
            return Promise.reject(err)
        })
        // axios响应拦截中间件
        // axios.interceptors.response.use(res => {
        //     console.log(res.headers)
        //     return res
        // }, err => {
        //     return Promise.reject(err)
        // })
    }
    // express切面中间件
    static expressMiddleware() {
        Instrument.routerMap = new Map()
        return (req, res, next) => {
            let tracer = Instrument.tracer
            let routerMap = Instrument.routerMap
            // 请求解包
            if (req.headers && req.headers.nodetracing) {
                // 获取父级上下文
                let parent = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers)
                // 生成span
                let operationName = `${req.method}${req.originalUrl}`
                routerMap.set(operationName, tracer.startSpan(operationName, { childOf: parent }))
            }
            // 路由结束上报
            res.once('finish', () => {
                let operationName = `${req.method}${req.originalUrl}`
                routerMap.get(operationName).finish()
                routerMap.delete(operationName)
            })
            return next()
        }
    }
    // koa切面中间件
    static koaMiddleware(koa) {

    }
}

module.exports = Instrument
