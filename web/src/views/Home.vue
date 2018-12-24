<template>
  <!-- <v-container fluid fill-weight fill-height> -->
    <v-layout>
      <!-- <v-flex shrink>Hello World</v-flex> -->
      <div id="topology" style="width:100%;height:500px"></div>
    </v-layout>
  <!-- </v-container> -->
</template>

<script>
export default {
  mounted() {
    // 调用绘制图表的方法
    this.drawDAG();
  },
  methods: {
    drawDAG() {
      let myChart = this.$echarts.init(document.getElementById("topology"));
      myChart.setOption({
        "backgroundColor":"white",
            "series": [{
                "label": {
                    "normal": {
                        "position": "top",
                        "textStyle": {
                            "fontSize": 22
                        },
                        "show": true
                    }
                },
                "edgeLabel": {
                    "normal": {
                        "formatter": function (param) {
                            return param.data.category;
                        },
                        "show": true,
                        "textStyle": {
                            "fontSize": 20
                        }
                    }
                },
                "type": "graph",
                "lineStyle": {
                    "normal": {
                        "opacity": 0.9,
                        "width": 1,
                        "curveness": 0
                    }
                },
                "data": [{
                    "name": "parent_span",
                    "category": "根"
                }, {
                    "name": "child_span",
                    "category": "注册"
                }],
                "links": [{
                    "source": "parent_span",
                    "target": "child_span",
                    "category": "注册"
                }],
                "categories": [{
                    "name": "根"
                }, {
                    "name": "注册"
                }],
                "layout": "force",
                "symbolSize": 25,
                "force": {
                    "repulsion": 1000,
                    "edgeLength": [150, 300]
                },
                "roam": true,
                "focusNodeAdjacency": true,
            }],
            "title": {
                "text": ""
            },
            "legend": [{
                "data": ["根", "注册"]
            }],
            "tooltip": {
                "formatter": function (param) {
                    if (param.dataType === 'edge') {
                        return param.data.category + ': ' + param.data.target;
                    }
                    return param.data.category + ': ' + param.data.name;
                }
            },
            "animationEasingUpdate": "quinticInOut",
            "animationDurationUpdate": 1500
        })
    }
  }
};
</script>

