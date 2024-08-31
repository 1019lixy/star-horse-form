<script lang="ts" setup>
import {Config} from "@/api/settings.ts";
import {getValidateImg, rtCode, userLogin} from "@/api/star_horse";
import {JSEncrypt} from "jsencrypt";
import {removeToken} from "@/utils/auth";
import {onMounted, reactive, ref, watch} from "vue";
import {RouteLocationNormalized, useRouter} from "vue-router";
import type {ElForm, FormInstance, FormRules, TabsPaneContext} from 'element-plus'
import {warning} from "@/utils/message";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {i18n} from "@/lang";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";

interface LoginInfo {
  userName: string;
  password: string;
  rememberMe: string;
  tokenId: string;
  validCode: string;
  uuid: string;
}

const loginTitle = Config.title;
let configStore = GlobalConfig(piniaInstance);
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
  userName: [{required: true, trigger: "blur", message: i18n("login.userName", ["starhorse.notAllowEmpty"])},],
  password: [{required: true, trigger: "blur", message: i18n("login.password", ["starhorse.notAllowEmpty"])},],
  validCode: [{required: true, trigger: "blur", message: i18n("login.validCode", ["starhorse.notAllowEmpty"])},],
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
  await elForm.validate(async (valid, _fields) => {
    loading.value = !loading.value;
    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey.value);
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
      let {errMsg} = await userLogin(user);
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
  configStore.clearAll();
  getValidateImg().then((res) => {
    let record = res.data.data;
    validateImg.value = record.img;
    uuid.value = record.uuid;
    showValid.value = record.validFlag as boolean;
    publicKey.value = record.publicKey;
  });
};
onMounted(() => {
  refreshValidate();
});
let rtCodeimg = ref("");
const handleClick = async (tab: TabsPaneContext, _event: Event) => {
  if (tab.paneName == "second") {
    rtCodeimg.value = await rtCode("hello");
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
            <div style="text-align: center;color: rgba(255, 255, 255,.8);">{{ i18n("starhorse.copyright") }}</div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title"></div>
        <div class="right-content">
          <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane :label="i18n('loginType.password')" name="first">
              <el-form
                  :model="loginForm"
                  :rules="loginRules"
                  class="login-form animate__animated animate__fadeIn"
                  label-position="top"
                  ref="loginFormRef"
              >
                <h2 style="text-align: center;font-weight: 700;font-size:1.5rem;line-height:2rem;width: 100%;">
                  {{ i18n("loginButton.login") }}</h2>
                <el-form-item prop="userName" :label="i18n('login.userName')" required>
                  <el-input
                      auto-complete="off"
                      @keyup.enter="handleLogin(loginFormRef)"
                      :placeholder="i18n('starhorse.pleaseInput','login.userName')"
                      prefix-icon="User"
                      type="text"
                      v-model="loginForm.userName"
                  >
                  </el-input>
                </el-form-item>
                <el-form-item prop="password" :label="i18n('login.password')" required>
                  <el-input
                      @keyup.enter="handleLogin(loginFormRef)"
                      :prefix-icon="flag?'Unlock':'Lock'"
                      auto-complete="off"
                      :placeholder="i18n('starhorse.pleaseInput','login.password')"
                      :type="flag?'text':'password'"
                      v-model="loginForm.password"
                  >
                    <template #suffix>
                      <el-icon @mousedown="getFlag" @mouseup="getFlag" style="cursor: pointer">
                        <component :is="flag?'view':'hide'"/>
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item v-if="showValid" prop="validCode" :label="i18n('login.validCode')" required>
                  <el-input @keyup.enter="handleLogin(loginFormRef)" auto-complete="off"
                            :placeholder="i18n('starhorse.pleaseInput','login.validCode')"
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
                      {{ i18n("login.rememberMe") }}
                    </el-checkbox>
                  </el-col>
                  <el-col :span="6">
                    <el-button link size="default"> {{ i18n("login.forget") }}</el-button>
                  </el-col>
                </el-row>
                <el-form-item style="width: 100%;height:30px;">
                  <el-button
                      :loading="loading"
                      @click="handleLogin(loginFormRef)"
                      style="width: 100%;background: var(--star-horse-style);color: var(--star-horse-white)"
                  >
                    <span v-if="!loading">{{ i18n("loginButton.login") }}</span>
                    <span v-else>{{ i18n("loginButton.logging") }}</span>
                  </el-button>
                </el-form-item>
                <el-form-item style="width: 100%;height:30px;">
                  <el-button style="width: 100%">
                    {{ i18n("loginButton.register") }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane :label="i18n('loginType.rtCode')" name="second">
              <div class="login-form" style="margin:0 auto;height: 455px">
                <img :src="rtCodeimg" :alt="i18n('loginType.validCode')">
              </div>
            </el-tab-pane>
          </el-tabs>
          <el-divider content-position="center">{{ i18n("loginType.otherType") }}</el-divider>
          <div class="other-login-icon">
            <el-tooltip :content="i18n('loginType.github')">
              <star-horse-icon icon-class="github" size="30px" cursor="pointer" @click="otherLogin('github')"/>
            </el-tooltip>
            <el-tooltip :content="i18n('loginType.wechat')">
              <star-horse-icon icon-class="wechat" size="30px" cursor="pointer" @click="otherLogin('wechat')"/>
            </el-tooltip>
            <el-tooltip :content="i18n('loginType.alipay')">
              <star-horse-icon icon-class="alipay" size="30px" cursor="pointer" @click="otherLogin('alipay')"/>
            </el-tooltip>
            <el-tooltip :content="i18n('loginType.weibo')">
              <star-horse-icon icon-class="weibo" size="30px" cursor="pointer" @click="otherLogin('weibo')"/>
            </el-tooltip>
          </div>
        </div>
      </div>
      <!--  底部  -->
    </div>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-input__icon), .el-icon {
  height: 2em !important;
  width: 2em !important;

  background: var(--star-horse-shadow);

  svg {
    height: 1.5em !important;
    width: 1.5em !important;
    color: var(--star-horse-style);
  }
}

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
        color: var(--star-horse-white);
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
  background: var(--star-horse-white);
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

:deep(.el-form-item) {
  margin-bottom: 18px !important;
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
