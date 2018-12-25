<template>
  <div>
    <v-navigation-drawer v-model="drawer" clipped fixed app width="200">
      <v-list dense>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dashboard</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>device_hub</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Topology</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Settings</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left dense>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>NodeTracing</v-toolbar-title>
      <img src="../assets/logo_white.png">
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
  })
};
</script>