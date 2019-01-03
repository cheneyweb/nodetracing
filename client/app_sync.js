// ==========自动探针==========
const nodetracing = require('nodetracing')
// const nodetracing = require('./nodetracing_modules/nodetracing/index.js')
const tracer = new nodetracing.Tracer({ serviceName: 'Sync', rpcAddress: 'localhost', auto: true, stackLog: false, maxDuration: 5000 })
// 切面注入需要监控的函数
main = nodetracing.aop(main)
phase1 = nodetracing.aop(phase1)
phase2 = nodetracing.aop(phase2)
phase3 = nodetracing.aop(phase3)
phase4 = nodetracing.aop(phase4)
// ==========自动探针==========

function main(a, b, c) {
    setTimeout(() => {
        console.log(phase1())
    }, 10)
    return 'main'
}

function phase1() {
    return 'phase1'
}

function phase2() {
    return 'phase2'
}

function phase3() {
    return 'phase3'
}

function phase4() {
    return 'phase4'
}

setTimeout(() => {
    console.log(main(1, 2, 3))
    console.log(main(1, 2, 3))
    // console.log(phase1())
}, 1000)

// console.log(phase2())
// console.log(phase3())
// console.log(phase4())
