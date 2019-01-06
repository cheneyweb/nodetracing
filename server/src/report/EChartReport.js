const Report = require('./Report.js')
const Cache = require('../cache/Cache.js')
const LevelDB = require('../cache/LevelDB.js')
/**
 * Echart图表报告输出
 */
class EChartReport extends Report {
    constructor(spans) {
        super(spans)
    }
    // 生成报告
    gen() {
        const serviceSet = Cache.serviceSet
        const serviceMap = Cache.serviceMap
        const serviceDAG = Cache.serviceDAG
        // 初始化收集缓存，用于批量持久化
        const ops = []
        for (let span of this.spans) {
            let serviceName = span.serviceName
            let service = serviceMap[serviceName] = serviceMap[serviceName] || { serviceName, spanSet: new Set(), spanDAG: { data: [], links: [], categories: [], legend: { data: [] } } }
            // 绘制service的spanDAG
            let serviceReferenceContext = drawSpanDAG(service, span)
            // 绘制serviceDAG
            if (!serviceSet.has(serviceName)) {
                drawServiceDAG(serviceDAG, service, serviceReferenceContext)
                ops.push({ type: 'put', key: `s_${serviceName}`, value: serviceName })
                serviceSet.add(serviceName)
            }
            // 根span额外处理
            if (span.depth == 0) {
                ops.push({ type: 'put', key: `so_${serviceName}.${span.operationName}`, value: span.operationName })
                ops.push({ type: 'put', key: `sos_${serviceName}.${span.operationName}.${4102416000000 - span.startMs}.${span.originId}`, value: span })
            }
            ops.push({ type: 'put', key: `${span.originId}.${span.id}`, value: span })
            ops.push({ type: 'put', key: `sm_${serviceName}`, value: { serviceName, spanSet: Array.from(service.spanSet), spanDAG: service.spanDAG } })
        }
        // 所有服务节点拓扑图持久化更新
        ops.push({ type: 'put', key: 'sdag', value: serviceDAG })
        // 异步持久化
        LevelDB.db.batch(ops)
    }
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