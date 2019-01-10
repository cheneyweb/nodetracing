<template>
  <v-layout d-flex justify-center fill-height>
    <v-parallax src="https://cdn.vuetifyjs.com/images/parallax/material.jpg" height="800">
      <!--登录/注册-->
      <v-layout align-center justify-center fill-height>
        <v-flex xs12 sm4 mr-1>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>登录</v-toolbar-title>
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
                  v-model="nickName"
                  prepend-icon="person"
                  name="login"
                  :label="label"
                  type="text"
                  :messages="['e.g. admin']"
                  maxlength="10"
                ></v-text-field>
                <v-text-field
                  prepend-icon="lock"
                  name="password"
                  label="Password"
                  id="password"
                  type="password"
                  :messages="['e.g. 123456']"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="login">Login</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
      <!--底部声明-->
      <v-layout justify-center fill-height>
        <v-flex xs12 sm4>
          <div class="text-xs-center">2018-2019 &copy;CheneyXu</div>
        </v-flex>
      </v-layout>
    </v-parallax>
    <!--错误提示-->
    <v-snackbar v-model="err" top auto-height color="warning">
      {{errMsg}}
      <v-btn color="gray" flat @click="err = false">Close</v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      nickName: "",
      openid: null,
      // regNickName: "",
      // loginNickName: "",
      label: "Account",
      dialog: false,
      err: false,
      errMsg: ""
    };
  },
  created: function() {
    // 身份认证有效期内，直接跳转
    // if (localStorage.getItem("token")) {
    //   this.$router.push({ path: "/home" });
    // }
  },
  methods: {
    // 登录
    async login() {
      if (this.nickName) {
        // let res = await this.$store.dispatch("login", {
        //   nickName: this.nickName
        // });
        let res = { err: false, res: "tokentest" };
        if (res.err) {
          this.err = res.err;
          this.errMsg = res.res;
        } else {
          localStorage.setItem("token", res.res);
          this.$router.push({ path: "/home" });
        }
      } else {
        this.err = true;
        this.errMsg = "Account";
      }
    }
  }
};
</script>


