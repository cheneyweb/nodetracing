const Report = require('./Report.js')
/**
 * Echart图表报告输出
 */
class EChartReport extends Report {
    constructor(spans) {
        super(spans)
    }
    dag() {
        let data = []
        let links = []
        let categories = []
        let legendData = []
        for (let span of this.spans) {
            let category = span.tags()['category']
            data.push({
                name: span.operationName(),
                category
            })
            for (let reference of span.references()) {
                links.push({
                    source: reference.referencedContext().span().operationName(),
                    target: span.operationName(),
                    category
                })
            }
            if (legendData.indexOf(category) == -1) {
                legendData.push(category)
                categories.push({
                    name: category
                })
            }
        }
        return { data, links, categories, legendData }
    }
}

module.exports = EChartReport