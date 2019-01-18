<template>
  <v-container fluid grid-list-sm>
    <v-layout row wrap>
      <v-flex d-flex xs12>
        <v-flex d-flex xs4>
          <v-hover>
            <v-card
              to="/service"
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
              to="/operation"
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
              <v-card-text>
                <v-tooltip bottom>
                  <span slot="activator">TracingCluster：{{stat.clusterCount}}</span>
                  <span>number of tracking nodes in operation：
                    <p
                      v-for="item in stat.tracingCluster"
                      :key="item.ipv4"
                    >{{item.ipv4}} [lastReport {{item.lastReport | formatDate}}]</p>
                  </span>
                </v-tooltip>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-flex>
      </v-flex>
      <v-flex xs5 mt-4>
        <v-treeview
          v-model="tree"
          :items="stat.tree"
          activatable
          hoverable
          item-key="name"
          open-on-click
          open-all
          :open="open"
        >
          <template slot="prepend" slot-scope="{item}">
            <v-icon @click="onClick(item)" v-if="item.name=='Services'">{{ 'device_hub' }}</v-icon>
            <v-icon @click="onClick(item)" v-else-if="item.children">{{ 'scatter_plot' }}</v-icon>
            <v-icon @click="onClick(item)" v-else>{{ 'view_list' }}</v-icon>
          </template>
          <template slot="label" slot-scope="{item}">
            <span @click="onClick(item)">{{item.name}}</span>
          </template>
          <!-- <template slot="append" slot-scope="{item}">
            <span @click="onClick()">{{item.name}}</span>
          </template>-->
        </v-treeview>
      </v-flex>
      <v-flex xs7>
        <div id="chart" style="width:100%;height:600px"></div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import dayjs from "dayjs";
export default {
  created() {
    this.getCount();
    setInterval(() => {
      this.getCount();
    }, 5000);
  },
  mounted() {
    this.drawGauge();
  },
  data: () => ({
    tree: [],
    open: [],
    stat: {
      serviceCount: 0,
      operationCount: 0,
      clusterCount: 0,
      durationAvg: 0,
      tracingCluster: [],
      tree: []
    },
    clusterInfo: "",
    icon: "device_hub",
    gauge: {
      name: "Avg：All Services"
    }
  }),
  filters: {
    formatDate(timestamp) {
      return dayjs(timestamp).format("YY/MM/DD HH:mm:ss");
    }
  },
  methods: {
    async getCount() {
      if (localStorage.getItem("token")) {
        this.stat = await this.$store.dispatch("getCount", {});
        this.open = ["Services"];
        this.drawGauge();
      }
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
            name: "Avg Duration",
            type: "gauge",
            radius: "85%",
            min: 0,
            max: 5000,
            detail: { formatter: "{value}ms" },
            data: [{ value: this.stat.durationAvg, name: this.gauge.name }],
            axisLine: {
              lineStyle: {
                color: [[0.2, "#91c7ae"], [0.5, "#63869e"], [1, "#c23531"]]
              }
            }
          }
        ]
      });
    },
    async onClick(item) {
      this.gauge.name =
        item.name == "Services" ? "Avg：All Services" : `Avg：${item.name}`;
      if (item.name == "Services") {
        this.getCount();
      } else if (item.children) {
        let res = await this.$store.dispatch("getServiceAvg", {
          serviceName: item.name
        });
        this.stat.durationAvg = res.durationAvg || 0;
      } else {
        let res = await this.$store.dispatch("getOperationAvg", {
          serviceName: item.parent,
          operationName: item.name
        });
        this.stat.durationAvg = res.durationAvg || 0;
      }
      this.drawGauge();
    }
  }
};
</script>