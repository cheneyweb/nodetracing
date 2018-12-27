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
    gen() {
        const spanArr = Cache.spanArr
        const spanMap = Cache.spanMap
        const spanTracerMap = Cache.spanTracerMap
        const serviceSet = Cache.serviceSet
        const serviceMap = Cache.serviceMap
        const serviceDAG = Cache.serviceDAG
        for (let span of spanArr) {
            // Map加入span
            spanMap[span.uuid] = span
            // 获取serviceName
            let serviceName = span.tracer.serviceName
            // 获取service
            let service = serviceMap[serviceName] = serviceMap[serviceName] || { serviceName, rootSpanMap: {}, spanSet: new Set(), spanDAG: { data: [], links: [], categories: [], legend: [{ data: [] }] } }
            // 筛选根span
            filterRootSpan(service, span)
            // 跟踪根span
            joinSpan(spanTracerMap, span)
            // 绘制service的spanDAG
            let serviceReferenceArr = drawSpanDAG(service, span)
            // 绘制serviceDAG
            !serviceSet.has(serviceName) && drawServiceDAG(serviceDAG, service, serviceReferenceArr)
            // 集合加入service
            serviceSet.add(serviceName)
        }
        // 重置span池
        Cache.spanArr = []
        // console.log(JSON.stringify(Cache.serviceDAG))
        console.log(JSON.stringify(serviceMap))
    }
}

// 筛选根span
function filterRootSpan(service, span) {
    if (span.references.length == 0) {
        service.rootSpanMap[span.operationName] = service.rootSpanMap[span.operationName] || []
        service.rootSpanMap[span.operationName].push(span)
    }
}
// 从根span出发，跟踪关联所有span集合
function joinSpan(spanTracerMap, span) {
    if (span.references.length == 0) {
        spanTracerMap[span.uuid] = spanTracerMap[span.uuid] || { depth: 0, spanArr: [span] }
    } else if (spanTracerMap[span.originId]) {
        if (spanTracerMap[span.originId].depth < span.depth) {
            spanTracerMap[span.originId].depth = span.depth
        }
        spanTracerMap[span.originId].spanArr.push(span)
    }
}
// 绘制所有服务拓扑图
function drawServiceDAG(serviceDAG, service, serviceReferenceArr) {
    let { data, links, categories, legendData } = serviceDAG
    // let category = span.tags['category']
    data.push({
        name: service.serviceName,
        // category
    })
    for (let serviceReference of serviceReferenceArr) {
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
                target: serviceReference.target
                // category
            })
        }
    }
    // if (legendData.indexOf(category) == -1) {
    //     legendData.push(category)
    //     categories.push({
    //         name: category
    //     })
    // }
}
// 绘制单服务Span拓扑图
function drawSpanDAG(service, span) {
    let serviceReferenceArr = []
    let spanSet = service.spanSet
    // 确保span节点不重复
    if (!spanSet.has(span.operationName)) {
        let { data, links, categories, legend } = service.spanDAG
        let category = span.tags['category']
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
            serviceReferenceArr.push({
                source: reference.referencedContext.tracer.serviceName,
                target: span.tracer.serviceName
            })
        }
        // 类目
        if (legend[0].data.indexOf(category) == -1) {
            legend[0].data.push(category)
            categories.push({
                name: category
            })
        }
        // 集合加入span
        spanSet.add(span.operationName)
    }
    return serviceReferenceArr
}

module.exports = EChartReport