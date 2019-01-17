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
    async getCount(state, data) {
      const res = await axios.get(`${domain}/nodetracing/dashboard/count`)
      return res.data
    },
    async login(state, data) {
      const res = await axios.post(`${domain}/nodetracing/user/login`, data)
      return res.data
    },
    async updateAuth(state, data) {
      const res = await axios.post(`${domain}/nodetracing/user/updateAuth`, data)
      return res.data
    }
  }
})

axios.interceptors.request.use((config) => {
  config.headers.token = localStorage.getItem('token')
  return config
})
axios.interceptors.response.use(data => {
  // if (data.status && data.status == 200 && data.data.err) {
  //   Message.error({ message: data.data.msg });
  //   return;
  // }
  return data
}, err => {
  if (err.response.status == 401) {
    localStorage.clear()
    window.location.href = window.location.href.split('#')[0]
    return Promise.resolve(err)
  }
})

