// const nodetracing = require('nodetracing')
const nodetracing = require('./nodetracing_modules/nodetracing/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'Express', rpcAddress: 'localhost', rpcPort: '36361', auto: true, stackLog: false, maxDuration: 30000 })
const express = require('express')

const app = express()

// ==========切面中间件==========
app.use(nodetracing.expressMiddleware())
// ==========切面中间件==========

app.get('/express', async (req, res) => {
    // await main()
    await waitASecond(200)
    res.send('Y')
})
app.listen(1111, () => {
    console.log('express模拟服务启动端口：1111')
})

// async function main() {
//     let parentSpan = tracer.startSpan('p2s')
//     parentSpan.setTag('category', '根')
//     await waitASecond(100)

//     await phase1(parentSpan)

//     parentSpan2 = await phase2(parentSpan)

//     phase3(parentSpan2)

//     parentSpan.finish()
// }

// async function phase1(parentSpan) {
//     let childSpan = tracer.startSpan('c2s1-1', { childOf: parentSpan })
//     childSpan.setTag('category', '注册1')
//     childSpan.log({ event: 'waiting' })
//     await waitASecond(200)
//     childSpan.log({ event: 'done' })
//     childSpan.finish()
//     return childSpan
// }

// async function phase2(parentSpan) {
//     let childSpan = tracer.startSpan('c2s1-2', { childOf: parentSpan })
//     childSpan.setTag('category', '注册2')
//     childSpan.log({ event: 'waiting' })
//     await waitASecond(300)
//     childSpan.log({ event: 'done' })
//     childSpan.finish()
//     return childSpan
// }

// async function phase3(parentSpan) {
//     let childSpan = tracer.startSpan('c2s2', { childOf: parentSpan })
//     childSpan.setTag('category', '注册3')
//     childSpan.log({ event: 'waiting' })
//     await waitASecond(400)
//     childSpan.log({ event: 'done' })
//     childSpan.finish()
//     return childSpan
// }

function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}