<template>
  <v-container fluid fill-height pt-2>
    <v-layout wrap>
      <v-flex xs12>
        <v-select
          :items="services"
          v-model="selectedService"
          @change="changeService"
          label="Select service"
        ></v-select>
      </v-flex>
      <v-flex xs12>
        <div id="dag" style="width:100%;height:600px"></div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    selectedService: "",
    services: []
  }),
  mounted() {
    this.getServices();
  },
  methods: {
    // 获取所有服务节点
    async getServices() {
      let res = await this.$store.dispatch("getServices", {});
      this.services = res;
      // 默认选中第一个服务节点
      this.selectedService = this.services[0];
      this.changeService(this.selectedService);
    },
    // 切换服务节点
    async changeService(e) {
      this.drawDAG(e);
    },
    // 绘制DAG
    async drawDAG(serviceName) {
      let res = await this.$store.dispatch("spanDAG", { serviceName });
      res.legend.textStyle = { color: "white" };
      this.$echarts.init(document.getElementById("dag")).setOption({
        backgroundColor: "#303030",
        title: {
          text: `【${serviceName || "Select service"}】 Spans DAG`,
          textStyle: {
            color: "white"
          }
        },
        series: [
          {
            label: {
              normal: {
                position: "top",
                textStyle: {
                  fontSize: 22
                },
                show: true
              }
            },
            edgeLabel: {
              normal: {
                formatter: function(param) {
                  return param.data.category;
                },
                show: true,
                textStyle: {
                  fontSize: 20
                }
              }
            },
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [10, 10],
            type: "graph",
            layout: "force",
            force: {
              // repulsion: 100,
              // gravity: 100,
              // initLayout: 'circular',
              repulsion: 60
              // edgeLength: 2
            },
            draggable: true,
            lineStyle: {
              normal: {
                opacity: 0.9,
                width: 1,
                curveness: 0
              }
            },
            data: res.data,
            links: res.links,
            categories: res.categories,
            layout: "force",
            symbolSize: 25,
            force: {
              repulsion: 1000,
              edgeLength: [150, 300]
            },
            roam: true,
            focusNodeAdjacency: true
          }
        ],
        legend: res.legend,
        tooltip: {
          formatter: function(param) {
            if (param.dataType === "edge") {
              return param.data.category + ": " + param.data.target;
            }
            return param.data.category + ": " + param.data.name;
          }
        },
        animationEasingUpdate: "quinticInOut",
        animationDurationUpdate: 1500
      });
    }
  }
};
</script>

