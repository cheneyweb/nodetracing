// const nodetracing = require('nodetracing')
const nodetracing = require('../nodetracing_modules/nodetracing/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'B1', rpcAddress: 'localhost', rpcPort: '36361' })
const axios = require('axios')

async function main() {
    let parentSpan = tracer.startSpan('main')
    parentSpan.setTag('category', 'async')
    await waitASecond(100)

    await phase1(parentSpan)

    parentSpan2 = await phase2(parentSpan)

    const headers = {}
    tracer.inject(parentSpan2, nodetracing.FORMAT_HTTP_HEADERS, headers)
    await axios.get('http://localhost:1111/express', { headers })

    phase3(parentSpan2)

    parentSpan.finish()
}

async function phase1(parentSpan) {
    let childSpan = tracer.startSpan('phase1', { childOf: parentSpan })
    childSpan.setTag('category', 'async')
    childSpan.log({ event: 'waiting' })
    await waitASecond(200)
    childSpan.log({ event: 'done' })
    childSpan.finish()
    return childSpan
}

async function phase2(parentSpan) {
    let childSpan = tracer.startSpan('phase2', { childOf: parentSpan })
    childSpan.setTag('category', 'async')
    childSpan.log({ event: 'waiting' })
    await waitASecond(300)
    childSpan.log({ event: 'done' })
    childSpan.finish()
    return childSpan
}

async function phase3(parentSpan) {
    let childSpan = tracer.startSpan('phase3', { childOf: parentSpan })
    childSpan.setTag('category', 'async')
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