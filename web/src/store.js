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
    async dag(state, data) {
      const res = await axios.get(`${domain}/nodetracing/echart/dag`)
      return res.data
    },
    // async login(state, data) {
    //   const res = await axios.post(`${domain}/gserver/auth/login`, data)
    //   return res.data
    // }
  }
})
