const nodetracing = require('nodetracing')
// const nodetracing = require('./nodetracing_modules/nodetracing/index.js')

// ==========切面中间件==========
appLocal = nodetracing.aop(appLocal)
// ==========切面中间件==========

async function appLocal() {
    await waitASecond(100)
}

function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}

module.exports = appLocal