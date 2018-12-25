const opentracing = require('opentracing')

const Tracer = require('./Tracer.js')
const Span = require('./Span.js')
const SpanContext = require('./SpanContext.js')

module.exports = { ...opentracing, Tracer, Span, SpanContext }