const opentracing = require('opentracing')
const Span = require('./Span.js')
/**
 * OpenTracing Tracer implementation
 */
class Tracer extends opentracing.Tracer {
    constructor() {
        super()
        this._spans = []
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
    report(reportClass) {
        const Report = require(`./${reportClass}`)
        return new Report(this._spans)
    }
}

module.exports = Tracer