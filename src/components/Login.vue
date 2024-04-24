<script lang="ts" setup>
import {Config} from "@/api/settings";
import {getValidateImg, rtCode, userLogin} from "@/api/star_horse";
import {JSEncrypt} from "jsencrypt";
import {removeToken} from "@/utils/auth";
import {onMounted, reactive, ref, watch} from "vue";
import {RouteLocationNormalized, useRouter} from "vue-router";
import type {ElForm, FormInstance, FormRules, TabsPaneContext} from 'element-plus'
import {warning} from "@/utils/message";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

interface LoginInfo {
  userName: string;
  password: string;
  rememberMe: string;
  tokenId: string;
  validCode: string;
  uuid: string;
}

const loginTitle = Config.title;
let validateImg = ref<string>("");
let uuid = ref<string>("");
let flag = ref<boolean>(false);
let redirect = ref<string>("");
let activeName = ref<string>("first");
let publicKey = ref<string>("");
let loading = ref<boolean>(false);
let loginForm = reactive<LoginInfo>({password: "", rememberMe: "", tokenId: "", userName: "", uuid: "", validCode: ""});
const loginFormRef = ref<FormInstance>();
let router = useRouter();
let showValid = ref<boolean>(false);
let loginRules = reactive<FormRules<LoginInfo>>({
  userName: [{required: true, trigger: "blur", message: "用户名不能为空"},],
  password: [{required: true, trigger: "blur", message: "密码不能为空"},],
  validCode: [{required: true, trigger: "blur", message: "验证码不能为空"},],
});
/**
 * 显示或者隐藏密码
 */
const getFlag = () => {
  flag.value = !flag.value;
};
/**
 * 处理登录信息
 */
const handleLogin = async (elForm: FormInstance | undefined) => {

  if (!elForm) return;
  await elForm.validate(async (valid, fields) => {
    loading.value = !loading.value;
    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const user = {
      userName: loginForm?.userName,
      password: loginForm?.password,
      rememberMe: loginForm?.rememberMe,
      tokenId: uuid.value,
      validCode: loginForm?.validCode,
      uuid: loginForm?.uuid,
    };
    //密码加密传输，需要加密时去掉注释，单后端认证服务需支持
    user["password"] = <string>encrypt.encrypt(loginForm.password);
    if (valid) {
      let {data, errMsg} = await userLogin(user);
      if (errMsg) {
        warning(errMsg);
        refreshValidate();
        loading.value = false;
      } else {
        loading.value = !loading.value;
        if (redirect.value) {
          router.push(<string>redirect.value);
        } else {
          router.push("/");
        }

      }
    }
  });
};
const refreshValidate = () => {
  removeToken();
  getValidateImg().then((res) => {
    let record = res.data.data;
    validateImg.value = record.img;
    uuid.value = record.uuid;
    showValid.value = record.validFlag as boolean;
    publicKey = record.publicKey;
  });
};
onMounted(() => {
  refreshValidate();
});
let rtCodeimg = ref("");
const handleClick = async (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName == "second") {
    let data = await rtCode("hello");
    rtCodeimg.value = data;
  }
}
/**
 * 其它方式登录
 * @param typeName
 */
const otherLogin = (typeName: string) => {
  console.log(typeName);
};
watch(
    () => router.currentRoute.value,
    (route: RouteLocationNormalized) => {
      redirect.value = route.query && route.query.redirect as string;
    },
    {
      deep: true,
      immediate: true,
    }
);
</script>
<style lang="scss" scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

:deep(#app) {
  height: 100%;
  margin: 0 auto;
}

.login {
  position: relative;
  height: 100%;

  .login-content {
    display: flex;
    margin-left: auto;
    margin-right: auto;
    height: 100%;

    .left {
      padding: 30px;
      flex: 1 1 0%;
      --tw-bg-opacity: 0.2;
      --tw-bg-opacity: 1;
      background-color: rgba(107, 114, 128, 1);

      .title {
        position: relative;
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 1);

        img {
          margin-right: 10px;
          height: 48px;
          display: block;
          vertical-align: middle;
          border-style: solid;
          max-width: 100%;
        }

        span {
          font-size: 20px;
          line-height: 1;
          font-weight: 700;
        }
      }

      .left_content {
        height: calc(100% - 60px);
        justify-content: center;
        align-items: center;
        display: flex;
      }
    }

    .right {
      padding: 30px;
      display: flex;
      flex-direction: row;
      flex: 1 1 0%;

      .title {
        justify-content: flex-end;
        color: rgba(255, 255, 255, 1);
        align-items: center;
        display: flex;
      }

      .right-content {
        max-width: 500px;
        margin: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }
  }
}

.__title {
  margin: 0 auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 500px;
  padding: 25px 25px 5px 25px;
}

.other-login-icon {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.login-form .el-input,
.el-button,
.login-form.el-input input {
  height: 42px;
}

.el-button > span {
  font-size: 18px;
}

.input-icon {
  height: 39px;
  width: 14px;
  margin-left: 2px;
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  display: inline-block;
  height: 38px;
  float: right;
}

.login-code img {
  cursor: pointer;
  vertical-align: middle;
}

.login-footer {
  width: 100%;
  clear: both;
}

.login-footer > span {
  width: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
  margin-top: 20px;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
}
</style>
<template>
  <div class="login">

    <div class="login-content">
      <div class="left">
        <div class="title">
          <img/>
          <span>{{ loginTitle }}</span>
        </div>
        <div class="left_content">
          <div>
            <div style="text-align:center;color: rgba(255, 255, 255,1);font-size: 1.875rem;
    line-height: 2.25rem;">{{ Config.title }}
            </div>
            <img src="../assets/login-box-bg.svg" alt="" style="width:350px">
            <div style="text-align: center;color: rgba(255, 255, 255,.8);">{{ Config.footerTxt }}</div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title"></div>
        <div class="right-content">
          <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="密码登录" name="first">
              <el-form
                  :model="loginForm"
                  :rules="loginRules"
                  class="login-form animate__animated animate__fadeIn"
                  label-position="top"
                  ref="loginFormRef"
              >
                <h2 style="text-align: center;font-weight: 700;font-size:1.5rem;line-height:2rem;width: 100%;">登录</h2>
                <el-form-item prop="userName" label="账&nbsp;&nbsp;号" required>
                  <el-input
                      auto-complete="off"
                      @keyup.enter="handleLogin(loginFormRef)"
                      placeholder="请输入用户名"
                      prefix-icon="User"
                      type="text"
                      v-model="loginForm.userName"
                  >
                  </el-input>
                </el-form-item>
                <el-form-item prop="password" label="密&nbsp;&nbsp;码" required>
                  <el-input
                      @keyup.enter="handleLogin(loginFormRef)"
                      :prefix-icon="flag?'Unlock':'Lock'"
                      auto-complete="off"
                      placeholder="请输入密码"
                      :type="flag?'text':'password'"
                      v-model="loginForm.password"
                  >
                    <template #suffix>
                      <el-icon @click="getFlag" style="cursor: pointer">
                        <component :is="flag?'view':'hide'"/>
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item v-if="showValid" prop="validCode" label="验证码" required>
                  <el-input @keyup.enter="handleLogin(loginFormRef)" auto-complete="off"
                            placeholder="请填写验证码"
                            style="width: 63%"
                            prefix-icon="key"
                            v-model="loginForm.validCode">
                  </el-input>
                  <div class="login-code">
                    <img :src="validateImg" @click="refreshValidate">
                  </div>
                </el-form-item>
                <el-row>
                  <el-col :span="18">
                    <el-checkbox style="margin: 0 0 25px 0" v-model="loginForm.rememberMe">
                      记住我
                    </el-checkbox>
                  </el-col>
                  <el-col :span="6">
                    <el-button link size="normal">忘记密码？</el-button>
                  </el-col>
                </el-row>
                <el-form-item style="width: 100%;height:30px;">
                  <el-button
                      :loading="loading"
                      @click="handleLogin(loginFormRef)"
                      style="width: 100%"
                      type="primary"
                  >
                    <span v-if="!loading">登 录</span>
                    <span v-else>登 录 中...</span>
                  </el-button>
                </el-form-item>
                <el-form-item style="width: 100%;height:30px;">
                  <el-button style="width: 100%">
                    注册
                  </el-button>
                </el-form-item>
              </el-form>

            </el-tab-pane>
            <el-tab-pane label="扫码登录" name="second">
              <div class="login-form" style="margin:0 auto;height: 455px">
                <img :src="rtCodeimg">
              </div>
            </el-tab-pane>
          </el-tabs>

          <el-divider content-position="center">其它登录方式</el-divider>
          <div class="other-login-icon">
            <el-tooltip content="GitHub">
              <star-horse-icon icon-class="github" size="30px" cursor="pointer" @click="otherLogin('github')"/>
            </el-tooltip>
            <el-tooltip content="微信">
              <star-horse-icon icon-class="wechat" size="30px" cursor="pointer" @click="otherLogin('wechat')"/>
            </el-tooltip>
            <el-tooltip content="支付宝">
              <star-horse-icon icon-class="alipay" size="30px" cursor="pointer" @click=
                  "otherLogin('alipay')"/>
            </el-tooltip>
            <el-tooltip content="微博">
              <star-horse-icon icon-class="weibo" size="30px" cursor="pointer" @click="otherLogin('weibo')"/>
            </el-tooltip>
          </div>
        </div>
      </div>

      <!--  底部  -->
    </div>
  </div>

</template>
