const Report = require('./Report.js')
/**
 * Span收集报告
 */
class CollectReport extends Report {
    constructor(spans) {
        super(spans)
    }
    // 生成报告
    async report() {
        // 上报处理结果
        let reportData = { spans: JSON.stringify(this.spans) }
        try {
            await global.reportRPC.invoke('report.Collect.upload', reportData)
        } catch (error) {
            console.error(error)
        }
    }
}
module.exports = CollectReport