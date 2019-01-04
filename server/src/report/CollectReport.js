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
        let rootSpans = []
        let childSpans = []
        // 遍历收集Span，筛选
        for (let span of this.spans) {
            if (span.depth == 0) {
                rootSpans.push(span)
            } else {
                childSpans.push(span)
            }
        }
        // 上报处理结果
        let reportData = { rootSpans: JSON.stringify(rootSpans), childSpans: JSON.stringify(childSpans) }
        try {
            await global.reportRPC.invoke('report.Collect.upload', reportData)
        } catch (error) {
            console.error(error)
        }
    }
}
module.exports = CollectReport