const nodetracing = require('./src/index.js')

async function main() {
    const tracer = new nodetracing.Tracer({ serviceName: 'demoserver' })

    let parentSpan = tracer.startSpan('parent_span')
    parentSpan.setTag('category', '根')

    await waitASecond(1000)

    let childSpan = tracer.startSpan('child_span', { childOf: parentSpan })
    childSpan.setTag('category', '注册')
    childSpan.log({ event: 'waiting' })

    await waitASecond(500)

    childSpan.log({ event: 'done' })
    childSpan.finish()
    parentSpan.finish()
}

function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}

main()