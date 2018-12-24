import Vue from 'vue'
import Vuex from 'vuex'

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
    // async reg(state, data) {
    //   const res = await axios.post(`${domain}/gserver/xnosql/user/create`, data)
    //   return res.data
    // },
    // async login(state, data) {
    //   const res = await axios.post(`${domain}/gserver/auth/login`, data)
    //   return res.data
    // }
  }
})
