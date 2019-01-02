const opentracing = require('opentracing')

const Tracer = require('./Tracer.js')
const Span = require('./Span.js')
const SpanContext = require('./SpanContext.js')
const Instrument = require('./Instrument')

module.exports = { ...opentracing, Tracer, Span, SpanContext, aop: Instrument.aop, axiosMiddleware: Instrument.axiosMiddleware, expressMiddleware: Instrument.expressMiddleware, koaMiddleware: Instrument.koaMiddleware }