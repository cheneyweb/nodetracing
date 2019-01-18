const Report = require('./Report.js')
const os = require('os')
/**
 * Span收集报告
 */
class CollectReport extends Report {
    constructor(spans) {
        super(spans)
    }
    // 生成报告
    async report(reportRPC) {
        // 上报处理结果
        let reportData = { spans: JSON.stringify(this.spans) }
        try {
            await reportRPC.invoke('report.Collect.upload', reportData, { ipv4: getIPv4() })
        } catch (error) {
            console.error(error)
        }
    }
}

function getIPv4() {
    const interfaces = os.networkInterfaces();
    const IPv4s = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2]
            if (address.family === 'IPv4' && !address.internal) {
                IPv4s.push(address.address)
            }
        }
    }
    return IPv4s.join(' & ')
}
module.exports = CollectReport