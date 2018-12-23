const nodetracing = require('./src/index.js')

console.log('\nRunning demo...\n')

const tracer = new nodetracing.Tracer()
console.log('Starting parent.')
let parent = tracer.startSpan('parent_span')
parent.setTag('custom', 'tag value')
parent.setTag('alpha', '1000')
console.log('Waiting to start child...')
setTimeout(() => {
    console.log('Starting child span.')
    let child = tracer.startSpan('child_span', { childOf: parent })
    child.setTag('alpha', '200')
    child.setTag('beta', '50')
    child.log({ state: 'waiting' })
    console.log('Waiting...')
    setTimeout(() => {
        console.log('Finishing child and parent.')
        child.log({ state: 'done' })
        child.finish()
        parent.finish()
        console.log('\nSpans:')
        let report = tracer.report()
        for (let span of report.spans) {
            let tags = span.tags()
            console.log("    " + span.operationName() + " - " + span.durationMs() + "ms")
            for (let key in tags) {
                var value = tags[key]
                console.log("        tag '" + key + "':'" + value + "'")
            }
        }
    }, 500)
}, 1000)