const nodetracing = require('./src/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'server-demo' })

async function main() {
    let parentSpan = tracer.startSpan('parent_span')
    parentSpan.setTag('category', '根')
    await waitASecond(100)

    await phase1(parentSpan)

    parentSpan2 = await phase2(parentSpan)

    phase3(parentSpan2)

    parentSpan.finish()
}

async function phase1(parentSpan) {
    let childSpan = tracer.startSpan('child_span1-1', { childOf: parentSpan })
    childSpan.setTag('category', '注册1')
    childSpan.log({ event: 'waiting' })
    await waitASecond(200)
    childSpan.log({ event: 'done' })
    childSpan.finish()
    return childSpan
}

async function phase2(parentSpan) {
    let childSpan = tracer.startSpan('child_span1-2', { childOf: parentSpan })
    childSpan.setTag('category', '注册2')
    childSpan.log({ event: 'waiting' })
    await waitASecond(300)
    childSpan.log({ event: 'done' })
    childSpan.finish()
    return childSpan
}

async function phase3(parentSpan) {
    let childSpan = tracer.startSpan('child_span2', { childOf: parentSpan })
    childSpan.setTag('category', '注册3')
    childSpan.log({ event: 'waiting' })
    await waitASecond(400)
    childSpan.log({ event: 'done' })
    childSpan.finish()
    return childSpan
}

function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}

main()