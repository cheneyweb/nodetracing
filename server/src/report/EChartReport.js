const Report = require('./Report.js')
const Cache = require('../cache/Cache.js')
/**
 * Echart图表报告输出
 */
class EChartReport extends Report {
    constructor(spans) {
        super(spans)
    }
    gen() {
        const spanArr = Cache.spanArr
        const rootSpanArr = Cache.rootSpanArr
        const serviceSet = Cache.serviceSet
        const serviceMap = Cache.serviceMap
        const serviceDAG = Cache.serviceDAG
        for (let span of spanArr) {
            // 筛选根span
            span.references.length == 0 && rootSpanArr.push(span)
            // 获取serviceName
            let serviceName = span.tracer.serviceName
            // 获取service
            let service = serviceMap[serviceName] = serviceMap[serviceName] || { spanDAG: { data: [], links: [], categories: [], legendData: [] } }
            // 绘制service的spanDAG
            let serviceReferenceArr = drawSpanDAG(service.spanDAG, span)
            // 绘制serviceDAG
            !serviceSet.has(service) && drawServiceDAG(serviceDAG, service, serviceReferenceArr)
            // 集合加入service
            serviceSet.add(serviceName)
        }
        // 重置span池
        Cache.spanArr = []
        console.log(JSON.stringify(serviceMap))
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
        !isRepeat && links.push({
            source: serviceReference.source,
            target: serviceReference.target
            // category
        })
    }
    // if (legendData.indexOf(category) == -1) {
    //     legendData.push(category)
    //     categories.push({
    //         name: category
    //     })
    // }
}
// 绘制单服务Span拓扑图
function drawSpanDAG(spanDAG, span) {
    let { data, links, categories, legendData } = spanDAG
    let category = span.tags['category']
    let serviceReferenceArr = []
    data.push({
        name: span.operationName,
        category
    })
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
    if (legendData.indexOf(category) == -1) {
        legendData.push(category)
        categories.push({
            name: category
        })
    }
    return serviceReferenceArr
}

module.exports = EChartReport