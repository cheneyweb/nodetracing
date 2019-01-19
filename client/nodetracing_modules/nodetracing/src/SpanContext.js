const opentracing = require('opentracing')
/**
 * OpenTracing SpanContext implementation
 */
class SpanContext extends opentracing.SpanContext {
    constructor(span) {
        super()
        let references = []
        for (let reference of span._references) {
            let referencedContext = reference.referencedContext()
            // TODO 这里是否需要深度递归，或者是否可以只返回单层关系？
            delete referencedContext.references
            references.push({
                type: reference.type(),
                referencedContext: referencedContext
            })
        }
        this.serviceName = span.serviceName
        this.id = span.id
        this.operationName = span.operationName
        this.startMs = span.startMs
        this.finishMs = span.finishMs
        this.durationMs = span.durationMs
        this.tags = JSON.stringify(span.tags)
        this.logs = JSON.stringify(span.logs)
        this.references = JSON.stringify(references)
        this.originId = span.originId
        this.parentId = span.parentId
        this.depth = span.depth
    }
}

module.exports = SpanContext