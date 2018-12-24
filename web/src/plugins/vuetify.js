import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

// 引入基本模板
const echarts = require('echarts/lib/echarts')
// 引入关系图等
require("echarts/lib/chart/graph")
// 引入提示框等
// require('echarts/lib/component/title')
// require('echarts/lib/component/tooltip')
// require('echarts/lib/component/legend')

Vue.prototype.$echarts = echarts

Vue.use(Vuetify, {
  iconfont: 'md',
})