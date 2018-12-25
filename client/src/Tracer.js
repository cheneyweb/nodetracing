const opentracing = require('opentracing')
const Span = require('./Span.js')

const rpcconfig = require('config')
const RPCClient = require('x-grpc').RPCClient
/**
 * OpenTracing Tracer implementation
 */
class Tracer extends opentracing.Tracer {
    constructor(config) {
        super()
        this._config = config
        this.serviceName = config.serviceName
        this._spans = []

        new RPCClient(rpcconfig.grpc).connect().then((rpc) => {
            this._rpc = rpc
            console.info(`NodeTracing客户端已连接服务节点【执行环境:${process.env.NODE_ENV},端口:${rpcconfig.grpc.port}】`)
        })
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
        span._startStack = new Error().stack
        this._spans.push(span)
        return span
    }
    _inject() {
        throw new Error('NOT YET IMPLEMENTED')
    }
    _extract() {
        throw new Error('NOT YET IMPLEMENTED')
    }
    // extend method
    clear() {
        this._spans = []
    }
    info() {
        return this._config
    }
    // report(reportClass) {
    //     const Report = require(`./${reportClass}`)
    //     return new Report(this._spans)
    // }
}

module.exports = Tracer