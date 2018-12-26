<template>
  <v-container fluid fill-height pt-0>
    <v-layout wrap>
      <v-flex xs12>
        <v-select :items="services" v-model="selectedService" @change="changeService"></v-select>
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
    this.getAllService();
  },
  methods: {
    async getAllService() {
      let res = await this.$store.dispatch("allservice", {});
      this.services = res;
      this.selectedService = this.services[0];
      this.changeService(this.selectedService);
    },
    async changeService(e) {
      this.drawDAG(e);
    },
    async drawDAG(serviceName) {
      let res = await this.$store.dispatch("spanDAG", { serviceName });
      this.$echarts.init(document.getElementById("dag")).setOption({
        backgroundColor: "gray",
        title: {
          text: `【${serviceName}】 Spans DAG`
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
            type: "graph",
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

