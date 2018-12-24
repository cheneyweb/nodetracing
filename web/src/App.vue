<template>
  <v-app>
    <v-content>
      <Layout/>
    </v-content>
  </v-app>
</template>

<script>
import Layout from "./views/Layout";
export default {
  name: "App",
  components: {
    Layout
  }
};
</script>
