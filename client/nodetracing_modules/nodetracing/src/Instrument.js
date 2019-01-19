const asyncHooks = require('async_hooks')
const R = require('ramda')
const opentracing = require('opentracing')
const grpc = require('grpc')
/**
 * 自动探针
 */
class Instrument {
    // 自动Span
    static autoSpan(triggerAsyncId, executionAsyncId, operationName) {
        let tracer = Instrument.tracer
        let contextMap = Instrument.contextMap
        let context = contextMap.get(executionAsyncId)
        let getParent = Instrument._getParent
        // 获取父级上下文
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
        // 跨度分类
        context.span.setTag('category', 'async')
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
            // let operationName = args.pop()
            // console.log(`before ${operationName}：${asyncHooks.executionAsyncId()}`)
            Instrument.autoSpan(asyncHooks.triggerAsyncId(), asyncHooks.executionAsyncId(), args.pop())
            return args
        }
        // 后置AOP
        async function afterAsync(res) {
            let contextMap = Instrument.contextMap
            let context = contextMap.get(asyncHooks.executionAsyncId())
            // let id = asyncHooks.executionAsyncId()
            await res
            // console.log(`after ${context.span.operationName}：${id}`)
            context.span.finish()
            return res
        }
        function after(res) {
            let contextMap = Instrument.contextMap
            let context = contextMap.get(asyncHooks.executionAsyncId())
            // let id = asyncHooks.executionAsyncId()
            // console.log(`after ${context.operationName}：${id}`)
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
    // axios切面中间件
    static axiosMiddleware() {
        let tracer = Instrument.tracer
        let getParent = Instrument._getParent
        // span注入
        return (config) => {
            // 获取父级上下文
            let parent = getParent(asyncHooks.triggerAsyncId())
            if (parent) {
                tracer.inject(parent.span, opentracing.FORMAT_HTTP_HEADERS, config.headers)
            }
            return config
        }
    }
    // express切面中间件
    static expressMiddleware() {
        Instrument.routerMap = new Map()
        // Instrument._gc()
        return (req, res, next) => {
            let tracer = Instrument.tracer
            let routerMap = Instrument.routerMap
            let originalPath = req.originalUrl.split('?')[0]
            let spanId = null
            // 请求解包
            if (req.headers && req.headers.nodetracing) {
                // 获取父级上下文
                let parent = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers)
                // 生成span
                let span = tracer.startSpan(`${req.method}${originalPath}`, { childOf: parent })
                span.setTag('category', 'http')
                // 存储span
                spanId = span.id
                routerMap.set(span.id, span)
            }
            // 路由结束上报
            res.on('finish', () => {
                if (routerMap.get(spanId)) {
                    routerMap.get(spanId).finish()
                    routerMap.delete(spanId)
                }
            })
            return next()
        }
    }
    // koa切面中间件
    static koaMiddleware() {
        Instrument.routerMap = new Map()
        // Instrument._gc()
        return (ctx, next) => {
            let tracer = Instrument.tracer
            let routerMap = Instrument.routerMap
            let originalPath = ctx.originalUrl.split('?')[0]
            let spanId = null
            // 请求解包
            if (ctx.header && ctx.header.nodetracing) {
                // 获取父级上下文
                let parent = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, ctx.header)
                // 生成span
                let span = tracer.startSpan(`${ctx.method}${originalPath}`, { childOf: parent })
                span.setTag('category', 'http')
                // 存储span
                spanId = span.id
                routerMap.set(span.id, span)
            }
            // 路由结束上报
            ctx.res.on('finish', () => {
                if (routerMap.get(spanId)) {
                    routerMap.get(spanId).finish()
                    routerMap.delete(spanId)
                }
            })
            return next()
        }
    }
    // grpc-client切面中间件
    static grpcClientMiddleware() {
        let tracer = Instrument.tracer
        let getParent = Instrument._getParent
        return (options, nextCall) => {
            return new grpc.InterceptingCall(nextCall(options), {
                start: function (metadata, listener, next) {
                    let parent = getParent(asyncHooks.triggerAsyncId())
                    if (parent) {
                        tracer.inject(parent.span, 'FORMAT_GRPC_METADATA', metadata)
                    }
                    next(metadata, listener)
                }
            })
        }
    }
    // grpc-server切面中间件
    static grpcServerMiddleware() {
        Instrument.routerMap = new Map()
        // Instrument._gc()
        return async (ctx, next) => {
            let tracer = Instrument.tracer
            let routerMap = Instrument.routerMap
            let nodetracingMetadata = ctx.call.metadata.get('nodetracing')
            let spanId = null
            // 请求解包
            if (nodetracingMetadata) {
                // 获取父级上下文
                let parent = tracer.extract('FORMAT_GRPC_METADATA', ctx.call.metadata)
                // 生成span
                let span = tracer.startSpan(ctx.service.path, { childOf: parent })
                span.setTag('category', 'grpc')
                // 存储span
                spanId = span.id
                routerMap.set(span.id, span)
            }
            await next()
            // 路由结束上报
            if (nodetracingMetadata && routerMap.get(spanId)) {
                routerMap.get(spanId).finish()
                routerMap.delete(spanId)
            }
        }
    }
    // 获取父级上下文
    static _getParent(parentId) {
        let contextMap = Instrument.contextMap
        let parentContext = contextMap.get(parentId)
        if (parentContext) {
            return parentContext.span ? { id: parentId, span: parentContext.span } : Instrument._getParent(parentContext.parentId)
        }
    }
    // 垃圾回收
    // static _gc() {
    //     let routerMap = Instrument.routerMap
    //     let tracer = Instrument.tracer
    //     setInterval(() => {
    //         let now = Date.now()
    //         routerMap.forEach((context, key) => {
    //             if (now - context.span.startMs > tracer._config.maxDuration) {
    //                 routerMap.delete(key)
    //             }
    //         })
    //         routerMap.size && console.log(`GC after：routerMap[${routerMap.size}]`)
    //     }, tracer._config.maxDuration)
    // }
}

module.exports = Instrument
