# nodetracing
完全支持opentracing的分布式追踪系统，致力于最简部署，最低侵入，最快开箱

## 项目起源
nodetracing是完全支持[opentracing](http://opentracing.io)标准实现的分布式日志追踪系统

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
### 1.1、后台单例-快速开始（PORT：3636，36361，36362）
```shell
cd server && npm run standalone
```
>open browser http://localhost:3636/nodetracing/web/index.html
### 1.2、单独启动后台WebUI服务（PORT：3636，36362）
```shell
cd server
npm run web
```
### 1.3、单独启动后台追踪服务（PORT：36361）
```shell
cd server
npm run server
```
### 1.4、ENV说明
```shell
#设置WEB端口即可启动可视化服务
WEB_PORT=3636

#追踪服务需要设置接收Span的RPC端口和上报Span的WEB服务地址
RPC_PORT=36361
REPORT_ADDR=localhost
```

### 2、后台集群（规划中...）
```shell
#docker compose
docker-compose -f "docker-compose.yml" up -d
#docker stack
docker stack deploy --prune -c docker-compose.yml nodetracing
```

### 3、探针初始化（在应用入口首行）
```js
const nodetracing = require('nodetracing')
```
```js
const tracer = new nodetracing.Tracer({
	serviceName: 'S1',		// 服务名称
	rpcAddress: 'localhost',// 后台追踪收集服务地址
	auto: true,				// 是否启用自动追踪
	stackLog: false,		// 是否记录详细堆栈信息（包括代码行号位置等，启用内存消耗较大）
	maxDuration: 30000 		// 最大函数执行时间（垃圾回收时间间隔）
})
```
*由此便完成了nodetracing的加载工作，接下来您可以根据您的服务类型选择以下自动探针/手动探针...*
### 3.1、async自动探针（支持async函数）
```js
func1 = nodetracing.aop(func1)
func2 = nodetracing.aop(func2)
...
```
### 3.2、http请求自动探针（axios）
```js
axios.interceptors.request.use(nodetracing.axiosMiddleware())
```
### 3.3、http响应自动探针（koa/express）
```js
//koa
app.use(nodetracing.koaMiddleware())
//express
app.use(nodetracing.expressMiddleware())
```
### 3.4、grpc-client自动探针（原生）
```js
const grpc = require('grpc')
const Service = grpc.loadPackageDefinition(...)[packageName][serviceName]
new Service("ip:port", grpc.credentials.createInsecure(), { interceptors: [nodetracing.grpcClientMiddleware()] })
```
### 3.5、grpc-server自动探针（原生）
```js
const grpc = require('grpc')
const interceptors = require('@echo-health/grpc-interceptors')
let server = new grpc.Server()
server = interceptors.serverProxy(this.server)
server.use(nodetracing.grpcClientMiddleware())
```
### 3.6、grpc-client自动探针（x-grpc框架）
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
### 3.7、grpc-server自动探针（x-grpc框架）
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


## 支持与帮助

虽然没有大型商业的支持，但是nodetracing也希望能持续坚持地完成它的使命

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
	<!-- 2019.01.06:服务连接等待/重试实现 -->