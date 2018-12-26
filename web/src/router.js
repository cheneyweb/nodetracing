import Vue from 'vue'
import Router from 'vue-router'
// import Login from './views/Login.vue'
import Topology from './views/Topology.vue'
import Service from './views/Service.vue'
import Endpoint from './views/Endpoint.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Topology
    },
    // {
    //   path: '/home',
    //   name: 'home',
    //   component: Home
    // },
    {
      path: '/topology',
      name: 'login',
      component: Topology
    },
    {
      path: '/service',
      name: 'login',
      component: Service
    },
    {
      path: '/endpoint',
      name: 'login',
      component: Endpoint
    }
  ]
})
