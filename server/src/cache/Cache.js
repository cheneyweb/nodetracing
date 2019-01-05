module.exports = {
    // span收集队列
    spanQueue: [],
    spanArr: [],
    // span图索引
    spanTracerMap: {},
    // 服务节点数组/图
    serviceSet: new Set(),
    serviceMap: {},
    serviceDAG: { data: [], links: [], categories: [], legend: { data: [] } }
}