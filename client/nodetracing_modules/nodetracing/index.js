const opentracing = require('opentracing')

const Tracer = require('./src/Tracer.js')
const Span = require('./src/Span.js')
const SpanContext = require('./src/SpanContext.js')
const Instrument = require('./src/Instrument')

module.exports = {
    ...opentracing,
    Tracer,
    Span,
    SpanContext,
    aop: Instrument.aop,
    axiosMiddleware: Instrument.axiosMiddleware,
    expressMiddleware: Instrument.expressMiddleware,
    koaMiddleware: Instrument.koaMiddleware,
    grpcClientMiddleware: Instrument.grpcClientMiddleware,
    grpcServerMiddleware: Instrument.grpcServerMiddleware
}