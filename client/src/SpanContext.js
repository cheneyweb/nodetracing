const opentracing = require('opentracing')
/**
 * OpenTracing SpanContext implementation
 */
class SpanContext extends opentracing.SpanContext {
    constructor(span) {
        super()
        this._span = span
    }
    span() {
        return this._span
    }
}

module.exports = SpanContext