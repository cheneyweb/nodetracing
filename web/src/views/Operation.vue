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
              @click="spanDetail(props.item.uuid)"
              class="text-xs-left"
            >{{ props.item.operationName }}</td>
            <td @click="spanDetail(props.item.uuid)">{{ props.item.uuid }}</td>
            <td @click="spanDetail(props.item.uuid)">
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
        >{{selectedOperation}}:{{dialogTitle}}</v-card-title>
        <v-card-text>
          <div id="gantt" style="width:800px;height:500px"></div>
        </v-card-text>
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
        { text: "Id", value: "id", sortable: false, width: "100" },
        { text: "Duration", value: "duration" }
      ],
      dialog: false,
      dialogTitle: ""
    };
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
    spanDetail(spanId) {
      this.dialogTitle = spanId;
      this.dialog = true;
      this.drawGantt(spanId);
    },
    async drawGantt(spanId) {
      let res = await this.$store.dispatch("getTracerSpans", { spanId });
      console.log(spanId)
      let self = this;
      // var data = [];
      // var dataCount = 10;
      var startTime = +new Date();
      var categories = ["Span1", "Span2", "Span3"].reverse();
      var types = [
        { name: "Service1", color: "#7b9ce1" },
        { name: "Service2", color: "#bd6d6c" }
      ];

      // Generate mock data
      // categories.forEach((category, index) => {
      //   var baseTime = startTime;
      //   // for (var i = 0; i < dataCount; i++) {
      //     var typeItem = types[Math.round(Math.random() * (types.length - 1))];
      //     var duration = Math.round(Math.random() * 10000);
      //     data.push();
      //     baseTime += Math.round(Math.random() * 2000);
      //   // }
      // });

      function renderItem(params, api) {
        var categoryIndex = api.value(0);
        var start = api.coord([api.value(1), categoryIndex]);
        var end = api.coord([api.value(2), categoryIndex]);
        var height = api.size([0, 1])[1] * 0.6;

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
            style: api.style()
          }
        );
      }

      let option = {
        backgroundColor: "gray",
        tooltip: {
          formatter: function(params) {
            return params.marker + params.name + ": " + params.value[3] + " ms";
          }
        },
        title: {
          text: "Operation Tracer",
          left: "center"
        },
        dataZoom: [
          {
            type: "slider",
            filterMode: "weakFilter",
            showDataShadow: false,
            top: 400,
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
        grid: {
          height: 300
        },
        xAxis: {
          min: startTime, // 需要使用根span的startMs
          scale: true,
          axisLabel: {
            formatter: function(val) {
              return Math.max(0, val - startTime) + " ms";
            }
          }
        },
        yAxis: {
          data: categories
        },
        series: [
          {
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
            data: [
              {
                name: types[0].name,
                value: [0, Date.now() + 5 * 1000, Date.now() + 7000, 2000],
                itemStyle: {
                  normal: {
                    color: types[0].color
                  }
                }
              },
              {
                name: types[1].name,
                value: [1, Date.now() + 6 * 1000, Date.now() + 7000, 1000],
                itemStyle: {
                  normal: {
                    color: types[1].color
                  }
                }
              }
            ]
          }
        ]
      };

      this.$echarts.init(document.getElementById("gantt")).setOption(option);
    }
  }
};
</script>

