# nodetracing
完全支持opentracing的分布式追踪系统，致力于最简部署，最低侵入，最快开箱

## 项目起源
nodetracing是完全支持[opentracing](http://opentracing.io)标准实现的分布式日志追踪系统

nodetracing由[nodejs](https://nodejs.org)编写，基于[opentracing-javascript](https://github.com/opentracing/opentracing-javascript)的API开发

对比同类项目包括
- [zipkin](https://github.com/openzipkin/zipkin)
- [jaeger](https://github.com/jaegertracing/jaeger)
- [skywalking](https://github.com/apache/incubator-skywalking)

以上项目的确功能强大，但也重型庞大。所以一套开箱即用，精简轻便，拓展灵活的分布式追踪系统是nodetracing的目标

## 设计理念

nodetracing会从开发工作者和运维工作者的角度出发，尽可能简单和高效，渐进式是最终的目标

采用nodejs开发服务端，跨平台，启动简单，且全面支持容器集群部署，同时前后端解耦，后期预计除了提供UI界面，还会提供API接口

不同语言客户端的探针支持，自动探针是首选（尽可能少的侵入代码），现阶段，优先支持的客户端探针有

- nodejs
- java（规划中...）

## 支持与帮助

虽然没有大型商业的支持，但是nodetracing也希望能持续坚持地完成它的使命

#更新日志
>
	2018.12.22:最小化实现opentracing
	2018.12.23:report演示完成
