const opentracing = require('opentracing')
const SpanContext = require('./SpanContext.js')
/**
 * OpenTracing Span implementation
 */
class Span extends opentracing.Span {
    constructor(tracer) {
        super()
        // 当前tracer
        this._tracer = tracer
        // 唯一id
        this._uuid = this._generateUUID()
        // 必须属性
        this._operationName = ''
        this._startMs = Date.now()
        this._finishMs = 0
        // 拓展属性
        this._tags = {}
        this._logs = []
        this._references = []
    }
    _context() {
        return new SpanContext(this)
    }
    _setOperationName(name) {
        this._operationName = name
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
            this._tags[key] = map[key]
        }
    }
    // 建议属性{error.kind,error.object,event,message,stack}，event必须
    _log(fields, timestamp = Date.now()) {
        this._logs.push({ fields, timestamp })
    }
    _finish(finishTime) {
        this._finishMs = finishTime || Date.now()
    }
    // extend method
    tracer() {
        return this._tracer
    }
    uuid() {
        return this._uuid
    }
    operationName() {
        return this._operationName
    }
    durationMs() {
        return this._finishMs - this._startMs
    }
    tags() {
        return this._tags
    }
    logs() {
        return this._logs
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
        this._references.push(reference)
    }
    references() {
        return this._references
    }

    debug() {
        let obj = {
            uuid: this._uuid,
            operationName: this._operationName,
            duration: [this._finishMs - this._startMs, this._startMs, this._finishMs]
        }
        if (Object.keys(this._tags).length) {
            obj.tags = this._tags
        }
        if (this._logs.length) {
            obj.logs = this._logs
        }
        if (this._references.length) {
            obj.references = this._references
        }
        return obj
    }

    _generateUUID() {
        let p0 = ("00000000" + Math.abs((Math.random() * 0xFFFFFFFF) | 0).toString(16)).substr(-8)
        let p1 = ("00000000" + Math.abs((Math.random() * 0xFFFFFFFF) | 0).toString(16)).substr(-8)
        return `${p0}${p1}`
    }
}

module.exports = Span