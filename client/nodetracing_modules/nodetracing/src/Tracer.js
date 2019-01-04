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
            port: +config.rpcPort || 36361,
            originalPath: true,
            protosDir: `${__dirname}/protos/`,
            serverAddress: config.rpcAddress || 'localhost'
        }).connect().then((rpc) => {
            this._rpc = rpc
            console.info(`NodeTracing-Client已连接服务节点【${config.rpcAddress}:36361】`)
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
            console.log(`GC after：contextMap[${contextMap.size}]`)
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
}

module.exports = Tracer