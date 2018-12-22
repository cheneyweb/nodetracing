/**
 * Index a collection of reported Spans
 */
class Report {
    constructor(spans) {
        this._spans = spans
        this._spansByUUID = {}
        this._spansByTag = {}
        this._debugSpans = []
        this._unfinishedSpans = []
        for (let span of this._spans) {
            if (span._finishMs === 0) {
                this._unfinishedSpans.push(span)
            }
            this._spansByUUID[span.uuid()] = span
            this._debugSpans.push(span.debug())
            for (let key of Object.keys(span.tags())) {
                var value = tags[key]
                this._spansByTag[key] = this._spansByTag[key] || {}
                this._spansByTag[key][value] = this._spansByTag[key][value] || []
                this._spansByTag[key][value].push(span)
            }
        }
    }
    firstSpanWithTagValue(key, value) {
        var m = this._spansByTag[key]
        if (!m) {
            return null
        }
        var n = m[value]
        if (!n) {
            return null
        }
        return n[0]
    }
}

module.exports = Report