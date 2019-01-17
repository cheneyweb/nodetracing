<template>
  <div>
    <v-navigation-drawer v-model="drawer" clipped fixed app width="200" v-if="isShow">
      <v-list dense>
        <v-list-tile to="/home">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dashboard</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/topology">
          <v-list-tile-action>
            <v-icon>device_hub</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Topology</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/service">
          <v-list-tile-action>
            <v-icon>scatter_plot</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Service</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/operation">
          <v-list-tile-action>
            <v-icon>view_list</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Operation</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Setting(Plan...)</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left dense v-if="isShow">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>NodeTracing</v-toolbar-title>
      <img src="../assets/logo_white.png">
      <v-spacer></v-spacer>
      <v-btn flat @click="logout">Logout</v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
    <!-- <v-footer app fixed>
      <div>2018-2019 &copy; CheneyXu</div>
    </v-footer>-->
  </div>
</template>

<script>
export default {
  data: () => ({
    drawer: null
  }),
  computed: {
    isShow() {
      return this.$route.path == "/" ? false : true;
    }
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push({ path: "/" });
    }
  }
};
</script>