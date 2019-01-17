import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import Topology from './views/Topology.vue'
import Service from './views/Service.vue'
import Operation from './views/Operation.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: Dashboard
    },
    {
      path: '/topology',
      name: 'topology',
      component: Topology
    },
    {
      path: '/service',
      name: 'service',
      component: Service
    },
    {
      path: '/operation',
      name: 'operation',
      component: Operation
    }
  ]
})
