<template>
  <!-- <v-content> -->
  <v-layout d-flex justify-center fill-height>
    <v-parallax src="https://cdn.vuetifyjs.com/images/parallax/material.jpg" height="800">
      <div class="text-xs-center">建议您【添加到主屏幕】或【收藏】以便下次打开</div>
      <div class="text-xs-center">若添加失败，请在系统中对本浏览器应用允许开启【创建桌面快捷方式】权限</div>
      <!--登录/注册-->
      <v-layout align-center justify-center fill-height>
        <v-flex xs12 sm4 mr-1>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>注册/登录文明</v-toolbar-title>
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
                  suffix="文明"
                  :messages="['1-5位中英文数字']"
                  maxlength="5"
                  @input="onInput"
                ></v-text-field>
                <v-text-field
                  v-if="isPassword"
                  prepend-icon="lock"
                  name="password"
                  label="Password"
                  id="password"
                  type="password"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="success" @click="reg">创建新文明</v-btn>
              <v-btn color="primary" @click="login">进入</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
        <!-- <v-flex xs12 sm4 ml-1>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>登录现有文明</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-text-field
                  v-model="loginNickName"
                  prepend-icon="person"
                  name="login"
                  label="文明名称/文明ID"
                  type="number"
                  :messages="['1-5位中英文数字']"
                ></v-text-field>
                <v-text-field
                  v-if="isPassword"
                  prepend-icon="lock"
                  name="password"
                  label="Password"
                  id="password"
                  type="password"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="reg" to="/home">进入</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>-->
      </v-layout>
      <!--注册成功提示框-->
      <v-dialog v-model="dialog" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>欢迎您：{{nickName}} 文明创世者</v-card-title>
          <v-card-text>文明的希望是不断的繁衍.</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="agree">开启文明</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!--底部声明-->
      <v-layout justify-center fill-height>
        <v-flex xs12 sm4>
          <v-img src="../img/icons/android-chrome-512x512.png" max-height="512" max-width="512">
            <div class="text-xs-center">2018-2019 &copy; CheneyXu</div>
          </v-img>
        </v-flex>

        <!-- <v-flex xs12 sm14> -->
        <!-- </v-flex> -->
        <!-- </v-layout> -->
        <!-- <v-layout justify-center fill-height> -->
      </v-layout>
    </v-parallax>
    <!--错误提示-->
    <v-snackbar v-model="err" top auto-height color="warning">
      {{errMsg}}
      <v-btn color="gray" flat @click="err = false">关闭</v-btn>
    </v-snackbar>
  </v-layout>
  <!-- </v-content> -->
</template>

<script>
export default {
  data() {
    return {
      nickName: "",
      openid: null,
      // regNickName: "",
      // loginNickName: "",
      label: "输入文明名称",
      isPassword: false,
      dialog: false,
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
    // 实时显示输入的文明名称
    onInput() {
      if (this.nickName) {
        this.label = `${this.nickName}文明`;
      } else {
        this.label = "输入文明名称";
      }
    },
    // 预注册，返回openid
    async reg() {
      if (this.nickName) {
        let res = await this.$store.dispatch("reg", {
          isPreCheck: true,
          nickName: this.nickName
        });
        if (res.err) {
          this.err = true;
          this.errMsg = res.res;
        } else {
          this.openid = res.res;
          this.dialog = true;
        }
      } else {
        this.err = true;
        this.errMsg = "请输入文明名称";
      }
    },
    // 同意注册，创建用户
    async agree() {
      let res = await this.$store.dispatch("reg", {
        nickName: this.nickName,
        openid: this.openid
      });
      if (res.err) {
        this.err = res.err;
        this.errMsg = res.res;
      } else {
        this.dialog = false;
        localStorage.setItem("token", res.res);
        this.$router.push({ path: "/home" });
      }
    },
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
        this.errMsg = "请输入文明名称";
      }
    }
  }
};
</script>


