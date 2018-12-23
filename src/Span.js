const opentracing = require('opentracing')
const SpanContext = require('./SpanContext.js')
/**
 * OpenTracing Span implementation
 */
class Span extends opentracing.Span {
    constructor(tracer) {
        super()
        this._tracer = tracer
        this._uuid = this._generateUUID()
        this._startMs = Date.now()
        this._finishMs = 0
        this._operationName = ''
        this._tags = {}
        this._logs = []
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
    _addTags(map) {
        for (let key in map) {
            this._tags[key] = map[key]
        }
    }
    _log(fields, timestamp) {
        this._logs.push({ fields, timestamp })
    }
    _finish(finishTime) {
        this._finishMs = finishTime || Date.now()
    }
    // extend method
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
    tracer() {
        return this._tracer
    }
    addReference() {
    }
    debug() {
        let obj = {
            uuid: this._uuid,
            operation: this._operationName,
            millis: [this._finishMs - this._startMs, this._startMs, this._finishMs]
        }
        if (Object.keys(this._tags).length) {
            obj.tags = this._tags
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