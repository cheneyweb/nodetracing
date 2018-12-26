import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

const domain = 'http://localhost:3636'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    drawer: false
  },
  mutations: {
    changeDrawer(state, params) {
      state.drawer = params
    }
  },
  actions: {
    async serviceDAG(state, data) {
      const res = await axios.get(`${domain}/nodetracing/echart/dag`)
      return res.data
    },
    async spanDAG(state, data) {
      const res = await axios.get(`${domain}/nodetracing/echart/dag/${data.serviceName}`)
      return res.data
    },
    async allservice(){
      const res = await axios.get(`${domain}/nodetracing/echart/service`)
      return res.data
    },
    async serviceOperation(state, data) {
      const res = await axios.get(`${domain}/nodetracing/echart/operation/${data.serviceName}`)
      return res.data
    },
    async operationSpan(state, data) {
      const res = await axios.get(`${domain}/nodetracing/echart/operation/${data.serviceName}/${data.operationName}`)
      return res.data
    },

    // async login(state, data) {
    //   const res = await axios.post(`${domain}/gserver/auth/login`, data)
    //   return res.data
    // }
  }
})
