# nodetracing
<img src="https://raw.githubusercontent.com/cheneyweb/nodetracing/master/web/public/img/icons/mstile-150x150.png" alt="nodetracing logo" height="100px" align="right" />

[![Build Status](https://travis-ci.com/cheneyweb/nodetracing.svg?branch=master)](https://travis-ci.com/cheneyweb/nodetracing)

[中文](/web/public/doc/README.md)

Distributed tracking system which is a fully implementation of [opentracing](http://opentracing.io) standard. committed to the simplest deployment, the lowest invasion, the fastest out of the box
design goals:
 - Simplicy for deployment
 - Non-invasion for development
 - Out-of-the-box for most scenarios
<!-- TOC -->

- [nodetracing](#nodetracing)
    - [Project Origin](#project-origin)
    - [Design Concept](#design-concept)
    - [Instructions](#instructions)
        - [1、Quick Setups](#1quick-setups)
        - [1.1、Quick Start - Standalone backend（PORT：3636，36361，36362）](#11quick-start---standaloneport36363636136362)
        - [1.2、Quick Start - WebUIServer（PORT：3636，36362）](#12quick-start---webuiserverport363636362)
        - [1.3、Quick Start - TracingServer（PORT：36361）](#13quick-start---tracingserverport36361)
        - [1.4、ENV](#14env)
        - [2、Docker Swarm Cluster](#2docker-swarm-cluster)
        - [3、Install probe](#3install-probe)
        - [3.1、Probe initialization (first line of application entry)](#31probe-initialization-first-line-of-application-entry)
        - [3.2、Async automatic probe (support for async function)](#32async-automatic-probe-support-for-async-function)
        - [3.3、Http-request automatic probe (axios)](#33http-request-automatic-probe-axios)
        - [3.4、Http-response automatic probe (koa/express)](#34http-response-automatic-probe-koaexpress)
        - [3.5、Grpc-client automatic probe (original)](#35grpc-client-automatic-probe-original)
        - [3.6、Grpc-server automatic probe (original)](#36grpc-server-automatic-probe-original)
        - [3.7、grpc-client automatic probe（x-grpc framewrok）](#37grpc-client-automatic-probex-grpc-framewrok)
        - [3.8、grpc-server automatic probe（x-grpc framewrok）](#38grpc-server-automatic-probex-grpc-framewrok)
        - [4、Manual probe](#4manual-probe)
        - [4.1、HTTP remote manual probe](#41http-remote-manual-probe)
        - [4.1、GRPC remote manual probe](#41grpc-remote-manual-probe)
        - [5、Examples of Probe Use](#5examples-of-probe-use)
    - [Support & Help](#support--help)
- [License](#license)

<!-- /TOC -->

![image](/web/public/img/demo-architecture.png)
![image](/web/public/img/demo-dashboard.png)
![image](/web/public/img/demo-topology.png)
![image](/web/public/img/demo-service.png)
![image](/web/public/img/demo-operation.png)
![image](/web/public/img/demo-span.png)

## Project Origin
Nodetracing is written by [nodejs](https://nodejs.org), base on [opentracing-javascript](https://github.com/opentracing/opentracing-javascript) API

Compare similar projects including：
- [zipkin](https://github.com/openzipkin/zipkin)
- [jaeger](https://github.com/jaegertracing/jaeger)
- [skywalking](https://github.com/apache/incubator-skywalking)

These above titans are indeed powerful, but also cumbersome and rigid in some way, so a out of box, lightweight and flexible "swissgear" is more likely met my imagination about an advanced distributed tracking system. now here it is, the name is Nodetrcing.

## Design Concept
Nodetracing will be as simple and efficient as possible from the perspective of the developer and manager. Progressive is the ultimate goal

Written in nodejs, cross-platform, easy to start, and fully support container cluster deployment, while decoupling frontend and backend, it is expected to provide API interface in addition to providing UI interface

Probe supports multiple language clients, automatic probes are preferred (less code intrusion), at this stage, priority support for automatic probes：

- nodejs（support：async function，axios，koa，express，grpc original，x-grpc framewrok）
- java（planing...）

## Instructions
### 1、Implementation Steps
The deployment of a typical distributed tracking system consists of the following two steps：
- Start collection service standalone/cluster > 
- Install probes for applications that need to be tracked > 

Then, along with the running of the application, the tracking information is displayed by the visualized WebUI interface

### 1.1、Quick Start - Standalone（PORT：3636，36361，36362）
```shell
cd server && npm run standalone
```
>open browser http://localhost:3636/nodetracing/web/index.html
### 1.2、Quick Start - WebUIServer（PORT：3636，36362）
```shell
cd server && npm run web
```
### 1.3、Quick Start - TracingServer（PORT：36361）
```shell
cd server && npm run server
```
### 1.4、ENV
```shell
#Visualization services can be started by setting up WEB ports
WEB_PORT=3636                 #for start WebUI Server

#Tracking services need to set up RPC ports for receiving Spans and WEB service addresses for reporting Spans
REPORT_ADDR=localhost         #required
RPC_PORT=36361                #option，default 36361

#Tracking service reporting interval
REPORT_INTERVAL=5000          #option，default 5000
#Service interface TOKEN key
TOKEN_KEY=tDTUusE2PWmKpIyK    #option，default 123456
```

### 2、Docker Swarm Cluster
[DockerHub：nodetracing-image](https://hub.docker.com/r/cheney/nodetracing)
```shell
#docker compose
docker-compose -f "docker-compose.yml" up -d

#docker stack
docker stack deploy --prune -c docker-compose.yml nodetracing
```

### 3、Install probe
```shell
npm i nodetracing
```
### 3.1、Probe initialization (first line of application entry)
```js
const nodetracing = require('nodetracing')
const tracer = new nodetracing.Tracer({
	serviceName: 'S1',      // required，name of service
	rpcAddress: 'localhost',// required，address of tracing service

	rpcPort: '36361',       // option，port of tracing service，default：36361
	auto: true,             // option，is enable automatic tracking，default：false
	stackLog: false,        // option，is record detailed stack information (including code line number location, etc., memory consumption is large)，default：false
	maxDuration: 30000      // option，maximum function execution time (garbage collection interval)，default：30000
})
```
*After completing the loading of nodetracing, then you can choose the following automatic probe/manual probe depending on your service type...*
### 3.2、Async automatic probe (support for async function)
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
### 3.3、Http-request automatic probe (axios)
```js
axios.interceptors.request.use(nodetracing.axiosMiddleware())
```
### 3.4、Http-response automatic probe (koa/express)
```js
//koa
app.use(nodetracing.koaMiddleware())
//express
app.use(nodetracing.expressMiddleware())
```
### 3.5、Grpc-client automatic probe (original)
```js
const grpc = require('grpc')
const Service = grpc.loadPackageDefinition(...)[packageName][serviceName]
new Service("ip:port", grpc.credentials.createInsecure(), { interceptors: [nodetracing.grpcClientMiddleware()] })
```
### 3.6、Grpc-server automatic probe (original)
```js
const grpc = require('grpc')
const interceptors = require('@echo-health/grpc-interceptors')
let server = new grpc.Server()
server = interceptors.serverProxy(this.server)
server.use(nodetracing.grpcClientMiddleware())
```
### 3.7、grpc-client automatic probe（x-grpc framewrok）
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
### 3.8、grpc-server automatic probe（x-grpc framewrok）
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

### 4、Manual probe
```js
// Create Root Span
let parentSpan = tracer.startSpan('sp1')
// Set Tag
parentSpan.setTag('category', 'Root')
// Create Child Span
let childSpan = tracer.startSpan('csp1', { childOf: parentSpan })
// Set Log
childSpan.log({ event: 'waiting' })
// Finish Span
childSpan.finish()
parentSpan.finish()
```

### 4.1、HTTP remote manual probe
```js
tracer.inject(parentSpan, nodetracing.FORMAT_HTTP_HEADERS, headers)
let parentSpan = tracer.extract(nodetracing.FORMAT_HTTP_HEADERS, headers)
```

### 4.1、GRPC remote manual probe
```js
tracer.inject(parentSpan, nodetracing.FORMAT_GRPC_METADATA, metadata)
let parentSpan = tracer.extract(nodetracing.FORMAT_GRPC_METADATA, metadata)
```

### 5、Examples of Probe Use
>client/example/app_koa.js<br>
client/example/app_express.js<br>
client/example/app_grpc.js<br>
client/example/app_manual.js<br>
client/example/example.js<br>
```shell
cd client && npm run start
```

## Support & Help
if nodetracing is helpful to you, I hope to get a Star of yours ：）

# License
[Apache License 2.0](/LICENSE)
