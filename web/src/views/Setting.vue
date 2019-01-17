<template>
  <v-container fluid>
    <v-layout row>
      <!-- <v-flex xs4>
        <v-subheader>Username</v-subheader>
      </v-flex>-->
      <v-flex xs12>
        <v-text-field label="Username" v-model="form.username" maxlength="25" counter="25"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout row>
      <!-- <v-flex xs4>
        <v-subheader>Password</v-subheader>
      </v-flex>-->
      <v-flex xs12>
        <v-text-field
          type="password"
          label="Password"
          v-model="form.password"
          maxlength="25"
          counter="25"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout row justify-start>
      <v-btn @click="onUpdate">Update</v-btn>
    </v-layout>
    <!--错误提示-->
    <v-snackbar v-model="err" top auto-height color="success">
      {{errMsg}}
      <v-btn flat @click="err = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  created() {},
  data: () => ({
    form: {
      username: null,
      password: null
    },
    err: false,
    errMsg: null
  }),
  methods: {
    async onUpdate() {
      let res = await this.$store.dispatch("updateAuth", this.form);
      if (res) {
        this.err = true;
        this.errMsg = "SUCCESS";
        setTimeout(() => {
          this.logout();
        }, 600);
      }
    },
    logout() {
      localStorage.clear();
      this.$router.push({ path: "/" });
    }
  }
};
</script>