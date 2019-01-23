const opentracing = require('opentracing')
const SpanContext = require('./SpanContext.js')
/**
 * OpenTracing Span implementation
 */
class Span extends opentracing.Span {
    constructor(tracer) {
        super()
        // 私有属性
        this._tracer = tracer       // 追踪器
        this._references = []       // 关联
        this._origin = null         // 起源
        // 追踪服务名
        this.serviceName = tracer.serviceName
        // 唯一id
        this.id = this._generateUUID()
        // 必须属性
        this.operationName = ''
        this.startMs = Date.now()
        this.finishMs = 0
        this.durationMs = 0
        // 拓展属性
        this.tags = {}
        this.logs = []
        // 关联属性
        this.originId = this.id     // 起源ID
        this.parentId = null        // 父级ID
        this.depth = 0              // 深度
    }
    _context() {
        return new SpanContext(this)
    }
    _setOperationName(name) {
        this.operationName = name
    }
    _setBaggageItem(key, value) {
        throw new Error('NOT YET IMPLEMENTED')
    }
    _getBaggageItem(key) {
        throw new Error('NOT YET IMPLEMENTED')
    }
    // 建议使用opentracing.Tags中的标签
    _addTags(map) {
        for (let key in map) {
            this.tags[key] = map[key]
        }
    }
    // 建议属性{error.kind,error.object,event,message,stack}，event必须
    _log(fields = {}, timestamp = Date.now()) {
        this.logs.push({ fields: JSON.stringify(fields), timestamp })
    }
    _finish(finishTime) {
        this.finishMs = finishTime || Date.now()
        this.durationMs = this.finishMs - this.startMs
        // 上报
        // console.log(JSON.stringify(this.context()))
        this._tracer._rpc.invoke('tracer.Queue.upload', { span: this.context() }).catch((err) => {
            console.error(err)
        })
    }
    // extend method
    tracer() {
        return this._tracer
    }
    references() {
        return this._references
    }
    // TODO 需要实现关联定制
    addReference(reference) {
        // switch (reference.type()) {
        //     case opentracing.REFERENCE_CHILD_OF:
        //         break;
        //     case opentracing.REFERENCE_FOLLOWS_FROM:
        //         break;
        //     default:
        //         break;
        // }
        this.originId = reference.referencedContext().originId
        this.parentId = reference.referencedContext().id
        this.depth = reference.referencedContext().depth + 1
        this._references.push(reference)
    }
    _generateUUID() {
        let p0 = ("00000000" + Math.abs((Math.random() * 0xFFFFFFFF) | 0).toString(16)).substr(-8)
        let p1 = ("00000000" + Math.abs((Math.random() * 0xFFFFFFFF) | 0).toString(16)).substr(-8)
        return `${p0}${p1}`
    }
}

module.exports = Span