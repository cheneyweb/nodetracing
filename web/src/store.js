import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

const domain = `http://${window.location.hostname}:3636`

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    openSpan: false
  },
  mutations: {
    openSpan(state, params) {
      state.openSpan = params
    }
  },
  actions: {
    async serviceDAG(state, data) {
      const res = await axios.get(`${domain}/nodetracing/echart/dag`)
      return res.data
    },
    async spanDAG(state, data) {
      if (data.serviceName) {
        const res = await axios.get(`${domain}/nodetracing/echart/dag/${data.serviceName}`)
        return res.data
      } else {
        return {}
      }
    },
    async getServices() {
      const res = await axios.get(`${domain}/nodetracing/service`)
      return res.data
    },
    async getServiceOperations(state, data) {
      if (data.serviceName) {
        const res = await axios.get(`${domain}/nodetracing/operation/${data.serviceName}`)
        return res.data
      } else {
        return []
      }
    },
    async getOperationSpans(state, data) {
      if (data.serviceName && data.operationName) {
        const res = await axios.get(`${domain}/nodetracing/operation/${data.serviceName}/${data.operationName}`)
        return res.data
      } else {
        return []
      }
    },
    async getTracerSpans(state, data) {
      if (data.spanId) {
        const res = await axios.get(`${domain}/nodetracing/span/tracer/${data.spanId}`)
        return res.data
      } else {
        return []
      }
    },
    async login(state, data) {
      const res = await axios.post(`${domain}/nodetracing/user/login`, data)
      return res.data
    }
  }
})

axios.interceptors.request.use((config) => {
  config.headers.token = localStorage.getItem('token')
  return config
})
