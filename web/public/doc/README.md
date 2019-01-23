# nodetracing
<img src="https://raw.githubusercontent.com/cheneyweb/nodetracing/master/web/public/img/icons/mstile-150x150.png" alt="nodetracing logo" height="100px" align="right" />

[![Build Status](https://travis-ci.com/cheneyweb/nodetracing.svg?branch=master)](https://travis-ci.com/cheneyweb/nodetracing)
[![OpenTracing Badge](https://img.shields.io/badge/OpenTracing-enabled-blue.svg)](http://opentracing.io)

[EN](/README.md)

完全支持[opentracing](http://opentracing.io)标准实现的分布式追踪系统，致力于最简部署，最低侵入，最快开箱
<!-- TOC -->

- [nodetracing](#nodetracing)
    - [项目起源](#项目起源)
    - [设计理念](#设计理念)
    - [使用说明](#使用说明)
        - [1、实施步骤](#1实施步骤)
        - [1.1、快速开始-后台单例（PORT：3636，36361，36362）](#11快速开始-后台单例port36363636136362)
        - [1.2、快速开始-单独启动WebUI服务（PORT：3636，36362）](#12快速开始-单独启动webui服务port363636362)
        - [1.3、快速开始-单独启动追踪服务（PORT：36361）](#13快速开始-单独启动追踪服务port36361)
        - [1.4、ENV说明](#14env说明)
        - [2、Docker Swarm集群部署](#2docker-swarm集群部署)
        - [3、安装探针](#3安装探针)
        - [3.1、探针初始化（在应用入口首行）](#31探针初始化在应用入口首行)
        - [3.2、async自动探针（支持async函数）](#32async自动探针支持async函数)
        - [3.3、http请求自动探针（axios）](#33http请求自动探针axios)
        - [3.4、http响应自动探针（koa/express）](#34http响应自动探针koaexpress)
        - [3.5、grpc-client自动探针（原生）](#35grpc-client自动探针原生)
        - [3.6、grpc-server自动探针（原生）](#36grpc-server自动探针原生)
        - [3.7、grpc-client自动探针（x-grpc框架）](#37grpc-client自动探针x-grpc框架)
        - [3.8、grpc-server自动探针（x-grpc框架）](#38grpc-server自动探针x-grpc框架)
        - [4、手动探针](#4手动探针)
        - [4.1、HTTP远程手动探针](#41http远程手动探针)
        - [4.1、GRPC远程手动探针](#41grpc远程手动探针)
        - [5、探针使用例子](#5探针使用例子)
    - [支持与帮助](#支持与帮助)
- [许可证](#许可证)
    - [更新日志](#更新日志)

<!-- /TOC -->

![image](/web/public/img/demo-architecture.png)
![image](/web/public/img/demo-dashboard.png)
![image](/web/public/img/demo-topology.png)
![image](/web/public/img/demo-service.png)
![image](/web/public/img/demo-operation.png)
![image](/web/public/img/demo-span.png)

## 项目起源
nodetracing由[nodejs](https://nodejs.org)编写，基于[opentracing-javascript](https://github.com/opentracing/opentracing-javascript)的API开发

对比同类项目包括
- [zipkin](https://github.com/openzipkin/zipkin)
- [jaeger](https://github.com/jaegertracing/jaeger)
- [skywalking](https://github.com/apache/incubator-skywalking)

以上项目的确功能强大，但也重型庞大，所以一套开箱即用，精简轻便，拓展灵活的分布式追踪系统是nodetracing的目标

## 设计理念

nodetracing会从开发工作者和运维工作者的角度出发，尽可能简单和高效，渐进式是最终的目标

采用nodejs开发服务端，跨平台，启动简单，且全面支持容器集群部署，同时前后端解耦，后期预计除了提供UI界面，还会提供API接口

不同语言客户端的探针支持，自动探针是首选（尽可能少的侵入代码），现阶段，优先支持的客户端自动探针有

- nodejs（支持：async函数，axios，koa，express，grpc原生，x-grpc框架）
- java（规划中...）

## 使用说明
### 1、实施步骤
一个典型的分布式追踪系统的部署包含以下两个步骤：
- 启动收集服务单例/集群 > 
- 针对需要追踪的应用布置探针 > 

然后伴随应用的运行，由可视化WebUI界面展示追踪信息
### 1.1、快速开始-后台单例（PORT：3636，36361，36362）
```shell
cd server && npm run standalone
```
>open browser http://localhost:3636/nodetracing/web/index.html
### 1.2、快速开始-单独启动WebUI服务（PORT：3636，36362）
```shell
cd server && npm run web
```
### 1.3、快速开始-单独启动追踪服务（PORT：36361）
```shell
cd server && npm run server
```
### 1.4、ENV说明
```shell
#设置WEB端口即可启动可视化服务
WEB_PORT=3636                 #若设置该环境变量端口，则会启动WEB可视化UI服务

#追踪服务需要设置接收Span的RPC端口和上报Span的WEB服务地址
REPORT_ADDR=localhost         #必须
RPC_PORT=36361                #可选，默认36361

#追踪服务上报时间间隔
REPORT_INTERVAL=5000          #可选，默认5000
#服务接口TOKEN密钥
TOKEN_KEY=tDTUusE2PWmKpIyK    #可选，默认123456
```

### 2、Docker Swarm集群部署
[DockerHub：nodetracing-image](https://hub.docker.com/r/cheney/nodetracing)
```shell
#docker compose
docker-compose -f "docker-compose.yml" up -d

#docker stack
docker stack deploy --prune -c docker-compose.yml nodetracing
```

### 3、安装探针
```shell
npm i nodetracing
```
### 3.1、探针初始化（在应用入口首行）
```js
const nodetracing = require('nodetracing')
const tracer = new nodetracing.Tracer({
	serviceName: 'S1',      // 必须，服务名称
	rpcAddress: 'localhost',// 必须，后台追踪收集服务地址

	rpcPort: '36361',       // 可选，后台追踪收集服务端口，默认：36361
	auto: true,             // 可选，是否启用自动追踪，默认：false
	stackLog: false,        // 可选，是否记录详细堆栈信息（包括代码行号位置等，启用内存消耗较大），默认：false
	maxDuration: 30000      // 可选，最大函数执行时间（垃圾回收时间间隔），默认：30000
})
```
*由此便完成了nodetracing的加载工作，接下来您可以根据您的服务类型选择以下自动探针/手动探针...*
### 3.2、async自动探针（支持async函数）
```js
async function func1(){
	...
}
async function func2(){
	...
}
func1 = nodetracing.aop(func1)
func2 = nodetracing.aop(func2)
...
```
### 3.3、http请求自动探针（axios）
```js
axios.interceptors.request.use(nodetracing.axiosMiddleware())
```
### 3.4、http响应自动探针（koa/express）
```js
//koa
app.use(nodetracing.koaMiddleware())
//express
app.use(nodetracing.expressMiddleware())
```
### 3.5、grpc-client自动探针（原生）
```js
const grpc = require('grpc')
const Service = grpc.loadPackageDefinition(...)[packageName][serviceName]
new Service("ip:port", grpc.credentials.createInsecure(), { interceptors: [nodetracing.grpcClientMiddleware()] })
```
### 3.6、grpc-server自动探针（原生）
```js
const grpc = require('grpc')
const interceptors = require('@echo-health/grpc-interceptors')
let server = new grpc.Server()
server = interceptors.serverProxy(this.server)
server.use(nodetracing.grpcClientMiddleware())
```
### 3.7、grpc-client自动探针（x-grpc框架）
```js
const RPCClient = require('x-grpc').RPCClient
const rpcClient = new RPCClient({
    port: 3333,
    protosDir: "/grpc/protos/",
    implsDir: "/grpc/impls/",
    serverAddress: "localhost"
})
rpcClient.use(nodetracing.grpcClientMiddleware())
rpcClient.connect()
let result = await rpcClient.invoke('demo.User.login', { username: 'cheney', password: '123456' } , optionMeta?)
```
### 3.8、grpc-server自动探针（x-grpc框架）
```js
const RPCServer = require('x-grpc').RPCServer
const rpcServer = new RPCServer({
    port: 3333,
    protosDir: "/grpc/protos/",
    implsDir: "/grpc/impls/",
    serverAddress: "localhost"
})
rpcServer.use(nodetracing.grpcServerMiddleware())
rpcServer.listen()
```

### 4、手动探针
```js
// 创建根Span
let parentSpan = tracer.startSpan('sp1')
// 设置标签
parentSpan.setTag('category', '根')
// 创建下级Span
let childSpan = tracer.startSpan('csp1', { childOf: parentSpan })
// 设置日志
childSpan.log({ event: 'waiting' })
// Span结束上报
childSpan.finish()
parentSpan.finish()
```

### 4.1、HTTP远程手动探针
```js
tracer.inject(parentSpan, nodetracing.FORMAT_HTTP_HEADERS, headers)
let parentSpan = tracer.extract(nodetracing.FORMAT_HTTP_HEADERS, headers)
```

### 4.1、GRPC远程手动探针
```js
tracer.inject(parentSpan, nodetracing.FORMAT_GRPC_METADATA, metadata)
let parentSpan = tracer.extract(nodetracing.FORMAT_GRPC_METADATA, metadata)
```

### 5、探针使用例子
>client/example/app_koa.js<br>
client/example/app_express.js<br>
client/example/app_grpc.js<br>
client/example/app_manual.js<br>
client/example/example.js<br>
```shell
cd client && npm run start
```


## 支持与帮助

如果NodeTracing对您有帮助，希望可以得到您的一颗Star ：）

# 许可证
[Apache License 2.0](/LICENSE)

## 更新日志
>
	2018.12.22:最小化实现opentracing
	2018.12.23:report演示完成
	2018.12.24:实现Reference，抽象Report，实现EChartReport，初步引入webui
	2018.12.25:服务结构整理，分为client,server,web；webui采用grpc与后端交互
	2018.12.26:输出所有服务拓扑，单服务所有Span拓扑，span时间线
	2018.12.27:完善webui，且准备引入甘特图，初步计算节点关系
	2018.12.28:整理SpanContext属性，完善上报数据格式，完善时间序列甘特图，实现tracer.inject和tracer.extract
	2018.12.29:nodejs自动探针实现
	2018.12.30:nodejs自动探针完善
	2019.01.01:支持AsyncFunction自动探针
	2019.01.02:垃圾回收完善，最小化内存开销，实现HTTP自动探针（支持axios,koa,express）
	2019.01.03:实现grpc自动探针
	2019.01.04:分离追踪服务与WebUI服务，为跟踪服务集群化奠定基础，文档更新，增加演示案例
	2019.01.05:采用LevelDB作为持久化方案
	2019.01.06:持久化海量Span与服务拓扑图
	2019.01.07:server增加LevelDB备份脚本backup.sh
	2019.01.10:建立数据枚举，WebUI完善
	2019.01.12:WebUI设置登录界面
	2019.01.14:UI接口请求全部使用JWT
	2019.01.15:UI接口请求增加TOKEN校验
	2019.01.17:UI增加Dashboard和Setting
	2019.01.18:UI的Dashboard页面完善
	2019.01.19:日志清理，GC优化，集群部署，nodetracing-client 0.8.0发布
	2019.01.20:文档更新
	2019.01.21:文档更新
	2019.01.23:add project to opentracing registry，优化grpc传输，精简计算复杂度，nodetracing-client 0.9.0发布
	<!-- 2019.01.24:服务连接重试实现 -->
