<template>
  <v-layout justify-center fill-height>
    <v-container fluid>
      <br>
      <br>
      <!--登录/注册-->
      <v-layout align-center justify-center fill-height>
        <v-flex xs12 sm4 mr-1>
          <v-card class="elevation-12">
            <v-toolbar>
              <v-toolbar-title>NodeTracing</v-toolbar-title>
              <img src="../assets/logo_white.png">
              <v-spacer></v-spacer>
              <!-- <v-tooltip bottom>
                <v-btn icon large :href="source" target="_blank" slot="activator">
                  <v-icon large>code</v-icon>
                </v-btn>
                <span>Source</span>
              </v-tooltip>-->
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-text-field
                  v-model="username"
                  prepend-icon="person"
                  name="login"
                  label="Account"
                  type="text"
                  :messages="['e.g. admin']"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  prepend-icon="lock"
                  name="password"
                  label="Password"
                  type="password"
                  :messages="['e.g. 123456']"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="login">Login</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
      <br>
      <!--底部声明-->
      <v-layout justify-center fill-height>
        <v-flex xs12 sm4>
          <div class="text-xs-center">2018-2019 &copy;CheneyXu</div>
        </v-flex>
      </v-layout>
    </v-container>
    <!--错误提示-->
    <v-snackbar v-model="err" top auto-height color="error">
      {{errMsg}}
      <v-btn flat @click="err = false">Close</v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script>
import bcrypt from "bcryptjs";
export default {
  data() {
    return {
      username: null,
      password: null,
      err: false,
      errMsg: ""
    };
  },
  created: function() {
    // 身份认证有效期内，直接跳转
    if (localStorage.getItem("token")) {
      this.$router.push({ path: "/home" });
    }
  },
  methods: {
    // 登录
    async login() {
      if (this.username && this.password) {
        let res = await this.$store.dispatch("login", {
          username: this.username,
          password: bcrypt.hashSync(this.password)
        });
        if (res) {
          localStorage.setItem("token", res);
          this.$router.push({ path: "/home" });
        } else {
          this.err = true;
          this.errMsg = "Auth Failed";
        }
      } else {
        this.err = true;
        this.errMsg = "Auth Failed";
      }
    }
  }
};
</script>


