<template>
  <v-container fluid grid-list-sm>
    <v-layout row wrap>
      <v-flex d-flex xs12>
        <v-flex d-flex xs4>
          <v-hover>
            <v-card
              slot-scope="{hover}"
              :class="`elevation-${hover?24:0}`"
              color="blue-grey"
              dark
              tile
              flat
            >
              <v-card-title>Services：0</v-card-title>
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
              <v-card-text>Operations：0</v-card-text>
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
              <v-card-text>Spans：0</v-card-text>
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
  mounted() {
    this.drawGauge();
  },
  data: () => ({
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
    // 绘制仪表盘
    async drawGauge(serviceName) {
      // let res = await this.$store.dispatch("spanDAG", { serviceName });
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
            data: [{ value: 0, name: "Runtime" }],
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