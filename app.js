const nodetracing = require('./src/index.js')

const tracer = new nodetracing.Tracer()
const span = tracer.startSpan('http_request')
console.log(span)
tracer.report()