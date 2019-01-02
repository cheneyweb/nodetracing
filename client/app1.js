const nodetracing = require('./src/index.js')
app1 = nodetracing.aop(app1)

async function app1() {
    await waitASecond(100)
}

function waitASecond(waitTime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, waitTime)
    })
}

module.exports = app1