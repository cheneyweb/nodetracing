const asyncHooks = require('async_hooks')
const opentracing = require('opentracing')
// const fs = require('fs')
const Span = require('./Span.js')
const Instrument = require('./Instrument.js')
// Remote Connection
const RPCClient = require('x-grpc').RPCClient
/**
 * OpenTracing Tracer implementation
 */
class Tracer extends opentracing.Tracer {
    constructor(config) {
        super()
        this._spans = []
        this._config = config
        this.serviceName = config.serviceName

        new RPCClient({
            port: 50051,
            originalPath: true,
            protosDir: `${__dirname}/protos/`,
            serverAddress: config.rpcAddress
        }).connect().then((rpc) => {
            this._rpc = rpc
            console.info(`NodeTracing客户端已连接追踪服务节点【${config.rpcAddress}:50051】`)
        })

        config.auto && this._auto()
    }
    _auto() {
        // CONTEXT_MAP
        Instrument.tracer = this
        let contextMap = Instrument.contextMap = new Map([[1, {}]])
        // ASYNC_HOOK
        const hook = asyncHooks.createHook({
            init(asyncId, type, triggerAsyncId) {
                contextMap.set(asyncId, { parentId: triggerAsyncId, span: null, isGC: false })
                // fs.writeSync(1, `${type}(${asyncId})<=p${triggerAsyncId}\n`);
            },
            destroy(asyncId) {
                if (contextMap.get(asyncId)) {
                    if (contextMap.get(asyncId).span) {
                        contextMap.get(asyncId).isGC = true
                    } else {
                        contextMap.delete(asyncId)
                    }
                }
            }
        })
        hook.enable()
        // GC
        this._config.maxDuration = this._config.maxDuration || 300000
        setInterval(() => {
            let now = Date.now()
            contextMap.forEach((context, key) => {
                if (context.isGC && (now - context.span.startMs > this._config.maxDuration)) {
                    contextMap.delete(key)
                }
            })
            // console.log(`GC after：${contextMap.size}`)
        }, this._config.maxDuration)
    }
    _startSpan(name, options) {
        let span = new Span(this)
        span.setOperationName(name)
        if (options.references) {
            for (let reference of options.references) {
                span.addReference(reference)
            }
        }
        // Capture the stack at the time the span started
        if (this._config.stackLog) {
            span._startStack = new Error().stack
        }
        this._spans.push(span)
        return span
    }
    _inject(spanContext, format, carrier = {}) {
        switch (format) {
            case opentracing.FORMAT_HTTP_HEADERS:
                carrier.nodetracing = encodeURI(JSON.stringify(spanContext))
                break
            case 'FORMAT_GRPC_METADATA':
                carrier.add('nodetracing', encodeURI(JSON.stringify(spanContext)))
                break
            default:
                break
        }
        return carrier
    }
    _extract(format, carrier) {
        switch (format) {
            case opentracing.FORMAT_HTTP_HEADERS:
                return JSON.parse(decodeURI(carrier.nodetracing))
            case 'FORMAT_GRPC_METADATA':
                return JSON.parse(decodeURI(carrier.get('nodetracing')))
            default:
                break
        }
    }
    // extend method
    clear() {
        this._spans = []
    }
    info() {
        return this._config
    }
    // auto() {
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
    //     return this
    // }
    // autoSpan(triggerAsyncId, executionAsyncId, operationName) {
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
    //         context.span = this.startSpan(operationName, { childOf: parent.span })
    //     }
    //     // 根Span
    //     else {
    //         context.span = this.startSpan(operationName)
    //     }
    //     // context.span.setTag('category', '自定义标签')
    //     // context.span.log({ event: '自定义日志事件' })
    //     // 存储上下文
    //     appHookMap.set(executionAsyncId, context)
    //     return context.span
    // }
    // aop(func) {
    //     let self = this
    //     function before(args) {
    //         console.log(`before：${asyncHooks.executionAsyncId()}`)
    //         self.autoSpan(asyncHooks.triggerAsyncId(), asyncHooks.executionAsyncId(), args.pop())
    //         return args
    //     }
    //     async function after(res) {
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
    // report(reportClass) {
    //     const Report = require(`./${reportClass}`)
    //     return new Report(this._spans)
    // }
}

module.exports = Tracer