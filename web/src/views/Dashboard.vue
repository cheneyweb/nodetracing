<template>
  <v-container fluid grid-list-sm>
    <v-layout row wrap>
      <v-flex d-flex xs12>
        <v-flex d-flex xs4>
          <v-hover>
            <v-card
              slot-scope="{hover}"
              :class="`elevation-${hover?24:0}`"
              color="teal"
              dark
              tile
              flat
            >
              <v-card-title>Services：{{stat.serviceCount}}</v-card-title>
            </v-card>
          </v-hover>
        </v-flex>
        <v-flex d-fle xs4>
          <v-hover>
            <v-card
              slot-scope="{hover}"
              :class="`elevation-${hover?24:0}`"
              color="blue-grey"
              dark
              tile
              flat
            >
              <v-card-text>Operations：{{stat.operationCount}}</v-card-text>
            </v-card>
          </v-hover>
        </v-flex>
        <v-flex d-fle xs4>
          <v-hover>
            <v-card
              slot-scope="{hover}"
              :class="`elevation-${hover?24:0}`"
              color="brown"
              dark
              tile
              flat
            >
              <v-card-text>Cluster：{{stat.clusterCount}}</v-card-text>
            </v-card>
          </v-hover>
        </v-flex>
      </v-flex>
      <v-flex xs5>
        <v-treeview v-model="tree" :open="open" :items="items" activatable item-key="name" open-all>
          <template slot="prepend" slot-scope="{ item, open, leaf }">
            <v-icon v-if="!item.file">{{ open ? 'mdi-folder-open' : 'mdi-folder' }}</v-icon>
            <v-icon v-else>{{ files[item.file] }}</v-icon>
          </template>
        </v-treeview>
      </v-flex>
      <v-flex xs7>
        <div id="chart" style="width:100%;height:600px"></div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  created() {
    this.getCount();
  },
  mounted() {
    this.drawGauge();
  },
  data: () => ({
    stat: {
      serviceCount: 0,
      operationCount: 0,
      clusterCount: 0,
      durationAvg: 0
    },
    open: ["public"],
    files: {
      html: "mdi-language-html5",
      js: "mdi-nodejs",
      json: "mdi-json",
      md: "mdi-markdown",
      pdf: "mdi-file-pdf",
      png: "mdi-file-image",
      txt: "mdi-file-document-outline",
      xls: "mdi-file-excel"
    },
    tree: [],
    items: [
      {
        name: "services",
        children: [
          {
            name: "s1",
            children: [
              {
                name: "main"
              }
            ]
          }
        ]
      }
    ]
  }),
  methods: {
    async getCount() {
      this.stat = await this.$store.dispatch("getCount", {});
      this.drawGauge();
    },
    async getDuration() {
      // let res = await this.$store.dispatch("spanDAG", { serviceName });
      this.drawGauge();
    },
    // 绘制仪表盘
    async drawGauge(serviceName) {
      this.$echarts.init(document.getElementById("chart")).setOption({
        tooltip: {
          formatter: "{a} <br/>{b} : {c}ms"
        },
        series: [
          {
            title: {
              textStyle: {
                color: "white"
              }
            },
            name: "Duration",
            type: "gauge",
            radius: "85%",
            min: 0,
            max: 5000,
            detail: { formatter: "{value}ms" },
            data: [{ value: this.stat.durationAvg, name: "Runtime" }],
            axisLine: {
              lineStyle: {
                color: [[0.2, "#91c7ae"], [0.5, "#63869e"], [1, "#c23531"]]
              }
            }
          }
        ]
      });
    }
  }
};
</script>