module.exports = {
    // 帐号密码
    username: null,
    password: null,
    tokenkey: null,
    // span收集队列/处理池
    spanQueue: [],
    spanArr: [],
    // 服务节点数组/图
    serviceSet: null,   // 启动时从持久化中加载
    serviceDAG: null,   // 启动时从持久化中加载，{ data: [], links: [], categories: [], legend: { data: [] } }
    serviceMap: {},     // 启动时从持久化中加载，{ serviceName, spanSet: new Set(), spanDAG: { data: [], links: [], categories: [], legend: { data: [] } } }
    // 跟踪集群信息
    tracingCluster: {}
}