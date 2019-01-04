const Report = require('./Report.js')
const Cache = require('../cache/Cache.js')
/**
 * Echart图表报告输出
 */
class EChartReport extends Report {
    constructor(spans) {
        super(spans)
    }
    // 生成报告
    gen(reportData) {
        const rootSpans = reportData.rootSpans
        const childSpans = reportData.childSpans
        const spanMap = Cache.spanMap
        const spanTracerMap = Cache.spanTracerMap
        const serviceSet = Cache.serviceSet
        const serviceMap = Cache.serviceMap
        const serviceDAG = Cache.serviceDAG
        // 1、处理根Span
        for (let span of rootSpans) {
            // Map加入span
            spanMap[span.id] = span
            // 获取serviceName
            let serviceName = span.serviceName
            // 获取service（TODO后期需要从持久化中获取）
            let service = serviceMap[serviceName] = serviceMap[serviceName] || { serviceName, rootSpanMap: {}, spanSet: new Set(), spanDAG: { data: [], links: [], categories: [], legend: { data: [] } } }
            // 将根Span按照service分组
            service.rootSpanMap[span.operationName] = service.rootSpanMap[span.operationName] || []
            service.rootSpanMap[span.operationName].push(span)
            // 跟踪根span
            tracerRootSpan(spanTracerMap, span)
            // 绘制service的spanDAG
            let serviceReferenceContext = drawSpanDAG(service, span)
            // 绘制serviceDAG
            !serviceSet.has(serviceName) && drawServiceDAG(serviceDAG, service, serviceReferenceContext)
            // 集合加入service
            serviceSet.add(serviceName)
        }
        // 2、处理非根Span        
        for (let span of childSpans) {
            // Map加入span
            spanMap[span.id] = span
            // 获取serviceName
            let serviceName = span.serviceName
            // 获取service（TODO后期需要从持久化中获取）
            let service = serviceMap[serviceName] = serviceMap[serviceName] || { serviceName, rootSpanMap: {}, spanSet: new Set(), spanDAG: { data: [], links: [], categories: [], legend: { data: [] } } }
            // 跟踪span
            tracerSpan(spanTracerMap, span)
            // 绘制service的spanDAG
            let serviceReferenceContext = drawSpanDAG(service, span)
            // 绘制serviceDAG
            !serviceSet.has(serviceName) && drawServiceDAG(serviceDAG, service, serviceReferenceContext)
            // 集合加入service
            serviceSet.add(serviceName)
        }
        // console.log(JSON.stringify(spanTracerMap))
        // console.log(JSON.stringify(serviceMap))
        // console.log(JSON.stringify(serviceDAG))
    }
}

// 从根span出发，跟踪关联所有span集合，开始
function tracerRootSpan(spanTracerMap, span) {
    if (!spanTracerMap[span.originId]) {
        spanTracerMap[span.originId] = { depth: 0, spanArr: [span] }
    } else {
        spanTracerMap[span.originId].spanArr[0] = span
    }
}
// 从根span出发，跟踪关联所有span集合，后续
function tracerSpan(spanTracerMap, span) {
    // 若根span未到达，先虚拟
    if (!spanTracerMap[span.originId]) {
        spanTracerMap[span.originId] = { depth: 0, spanArr: [{ id: span.originId }] }
    }
    // 更新跟踪深度
    if (spanTracerMap[span.originId].depth < span.depth) {
        spanTracerMap[span.originId].depth = span.depth
    }
    // 跟踪集合增加
    spanTracerMap[span.originId].spanArr.push(span)
}

// 绘制单服务Span拓扑图
function drawSpanDAG(service, span) {
    let serviceReferenceContext = { category: span.tags.category, referenceArr: [] }
    let spanSet = service.spanSet
    // 确保span节点不重复
    if (!spanSet.has(span.operationName)) {
        let { data, links, categories, legend } = service.spanDAG
        let category = span.tags.category
        // 节点
        data.push({
            name: span.operationName,
            category
        })
        // 关联
        for (let reference of span.references) {
            links.push({
                source: reference.referencedContext.operationName,
                target: span.operationName,
                category
            })
            serviceReferenceContext.referenceArr.push({
                source: reference.referencedContext.serviceName,
                target: span.serviceName,
                category
            })
        }
        // 类目
        if (legend.data.indexOf(category) == -1) {
            legend.data.push(category)
            categories.push({ name: category })
        }
        // 集合加入span
        spanSet.add(span.operationName)
    }
    return serviceReferenceContext
}
// 绘制所有服务拓扑图
function drawServiceDAG(serviceDAG, service, serviceReferenceContext) {
    let { data, links, categories, legend } = serviceDAG
    let category = serviceReferenceContext.category
    let referenceArr = serviceReferenceContext.referenceArr
    data.push({
        name: service.serviceName,
        category
    })
    for (let serviceReference of referenceArr) {
        // 是否存在重复关联
        let isRepeat = false
        for (let link of links) {
            if (link.source == serviceReference.source && link.target == serviceReference.target) {
                isRepeat = true
            }
        }
        // 添加关联
        if (!isRepeat) {
            links.push({
                source: serviceReference.source,
                target: serviceReference.target,
                category
            })
        }
    }
    // 类目
    if (legend.data.indexOf(category) == -1) {
        legend.data.push(category)
        categories.push({ name: category })
    }
}


module.exports = EChartReport