module.exports = {
    // span池
    spanArr: [],
    rootSpanArr: [],
    // 服务节点数组/图
    serviceSet: new Set(),
    serviceMap: {},
    serviceDAG: { data: [], links: [], categories: [], legendData: [] }
}