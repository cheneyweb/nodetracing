<template>
  <v-container fluid fill-height pt-0>
    <v-layout wrap>
      <v-flex xs6>
        <v-select :items="services" v-model="selectedService" @change="getServiceOperations"></v-select>
      </v-flex>
      <v-flex xs6>
        <v-select :items="operations" v-model="selectedOperation" @change="getOperationSpans"></v-select>
      </v-flex>
      <v-flex xs12>
        <v-data-table :headers="headers" :items="spans" hide-actions :loading="loading">
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="items" slot-scope="props">
            <td
              @click="spanDetail(props.item.id)"
              class="text-xs-left"
            >{{ props.item.operationName }}：{{ props.item.id }}</td>
            <td @click="spanDetail(props.item.id)">{{ props.item.startMs | formatDate}}</td>
            <td @click="spanDetail(props.item.id)">
              <v-layout>
                <v-flex xs11>
                  <v-progress-linear color="error" height="20" value="75"></v-progress-linear>
                </v-flex>
                <v-flex xs1 align-self-center>{{ props.item.duration }}ms</v-flex>
              </v-layout>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <v-dialog v-model="dialog" width="1000">
      <v-card>
        <v-card-title
          class="headline grey darken-2"
          primary-title
        >{{selectedOperation}}：{{dialogTitle}}</v-card-title>
        <!-- <v-card-text> -->
        <div id="gantt" style="width:100%;height:500px"></div>
        <!-- </v-card-text> -->
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click="dialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import dayjs from "dayjs";
export default {
  data() {
    return {
      loading: true,
      services: [],
      operations: [],
      spans: [],
      selectedService: "",
      selectedOperation: "",
      headers: [
        {
          text: "Operation",
          align: "left",
          sortable: false,
          value: "operationName",
          width: "300"
        },
        { text: "Start", value: "startMs", width: "200" },
        { text: "Duration", value: "duration" }
      ],
      dialog: false,
      dialogTitle: ""
    };
  },
  filters: {
    formatDate(timestamp) {
      return dayjs(timestamp).format("YY/MM/DD HH:mm:ss");
    }
  },

  created() {
    this.getServices();
  },
  methods: {
    // 获取所有服务节点
    async getServices() {
      this.loading = true;
      let res = await this.$store.dispatch("getServices", {});
      this.services = res;
      // 默认选中第一个服务节点
      this.selectedService = this.services[0];
      this.getServiceOperations(this.selectedService);
    },
    // 获取单个服务节点的所有操作
    async getServiceOperations(e) {
      this.loading = true;
      let res = await this.$store.dispatch("getServiceOperations", {
        serviceName: this.selectedService
      });
      this.operations = res;
      // 默认选中第一个操作
      this.selectedOperation = this.operations[0];
      this.getOperationSpans();
    },
    // 获取单个操作的所有根Span
    async getOperationSpans() {
      let res = await this.$store.dispatch("getOperationSpans", {
        serviceName: this.selectedService,
        operationName: this.selectedOperation
      });
      this.spans = res;
      this.loading = false;
    },
    // 获取单个根Span追踪甘特图
    spanDetail(spanId) {
      this.dialogTitle = spanId;
      this.dialog = true;
      this.drawGantt(spanId);
    },
    async drawGantt(spanId) {
      let self = this;
      let res = await this.$store.dispatch("getTracerSpans", { spanId });
      let startTime = res.spanArr[0].startMs;
      let operations = [];
      let spans = [];
      let series = [];
      let colors = [
        "#669999",
        "#996600",
        "#990033",
        "#336633",
        "#999900",
        "#FF9933",
        "#663366",
        "#CCCC00",
        "#CC6633",
        "#99CC33"
      ];
      let serviceColorMap = {};
      // 每个服务设置其颜色
      for (let i = 0; i < res.serviceArr.length; i++) {
        serviceColorMap[res.serviceArr[i].serviceName] = colors[i];
      }
      // 所有span（逆序添加）
      for (let i = 0; i < res.spanArr.length; i++) {
        let span = res.spanArr[i];
        spans.push({
          name: span.serviceName,
          value: [
            res.spanArr.length - 1 - i,
            span.startMs,
            span.finishMs,
            span.durationMs,
            span.serviceName
          ],
          itemStyle: {
            normal: {
              color: serviceColorMap[span.serviceName]
            }
          }
        });
        operations.unshift(span.operationName);
      }
      // 每个服务添加其span
      for (let service of res.serviceArr) {
        let serie = {
          name: service,
          type: "custom",
          renderItem: renderItem,
          itemStyle: {
            normal: {
              opacity: 0.8
            }
          },
          encode: {
            x: [1, 2],
            y: 0
          },
          data: []
        };
        for (let span of spans) {
          if (span.value[4] == service) {
            serie.data.push(span);
          }
        }
        series.push(serie);
      }
      // 自定义渲染
      function renderItem(params, api) {
        var categoryIndex = api.value(0);
        var start = api.coord([api.value(1), categoryIndex]);
        var end = api.coord([api.value(2), categoryIndex]);
        var height = api.size([0, 1])[1] * 0.5;
        var duration = api.value(3);

        var rectShape = self.$echarts.graphic.clipRectByRect(
          {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height: height
          },
          {
            x: params.coordSys.x,
            y: params.coordSys.y,
            width: params.coordSys.width,
            height: params.coordSys.height
          }
        );

        return (
          rectShape && {
            type: "rect",
            shape: rectShape,
            style: api.style({
              text: `${duration}ms`
            })
          }
        );
      }
      this.$echarts.init(document.getElementById("gantt")).setOption({
        color: colors,
        backgroundColor: "gray",
        tooltip: {
          formatter: function(params) {
            return (
              `${params.marker}${params.name}<br/>` +
              `service：${params.value[4]}<br/>` +
              `range：${params.value[1] - startTime}ms-${params.value[2] -
                startTime}ms<br/>` +
              `duration：${params.value[3]}ms`
            );
          }
        },
        title: {
          text: `Operation Tracer \n span:${res.spanArr.length} depth:${
            res.depth
          }`,
          left: "center"
        },
        dataZoom: [
          {
            type: "slider",
            filterMode: "weakFilter",
            showDataShadow: false,
            bottom: 10,
            height: 10,
            borderColor: "transparent",
            backgroundColor: "#e2e2e2",
            handleIcon:
              "M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z", // jshint ignore:line
            handleSize: 20,
            handleStyle: {
              shadowBlur: 6,
              shadowOffsetX: 1,
              shadowOffsetY: 2,
              shadowColor: "#aaa"
            },
            labelFormatter: ""
          },
          {
            type: "inside",
            filterMode: "weakFilter"
          }
        ],
        // grid: {
        //   height: 380
        // },
        xAxis: {
          min: startTime, // 需要使用根span的startMs
          scale: true,
          axisLabel: {
            formatter: function(val) {
              return Math.max(0, val - startTime) + " ms";
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed"
            }
          }
        },
        yAxis: {
          data: operations,
          splitLine: {
            show: false,
            lineStyle: {
              color: "dark"
            }
          }
        },
        legend: {
          type: "scroll",
          top: 40
        },
        series
      });
    }
  }
};
</script>

