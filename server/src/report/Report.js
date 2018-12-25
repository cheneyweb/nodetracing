/**
 * 报告基类
 */
class Report {
    constructor(spans) {
        this.spans = spans
        // this.spansByUUID = {}
        // this.spansByTag = {}
        // this.debugSpans = []
        // this.unfinishedSpans = []
        // for (let span of this.spans) {
        //     if (span._finishMs === 0) {
        //         this.unfinishedSpans.push(span)
        //     }
        //     this.spansByUUID[span.uuid()] = span
        //     let tags = span.tags()
        //     for (let key of Object.keys(tags)) {
        //         var value = tags[key]
        //         this.spansByTag[key] = this.spansByTag[key] || {}
        //         this.spansByTag[key][value] = this.spansByTag[key][value] || []
        //         this.spansByTag[key][value].push(span)
        //     }
        // }
    }
    // firstSpanWithTagValue(key, value) {
    //     var m = this.spansByTag[key]
    //     if (!m) {
    //         return null
    //     }
    //     var n = m[value]
    //     if (!n) {
    //         return null
    //     }
    //     return n[0]
    // }
}

module.exports = Report