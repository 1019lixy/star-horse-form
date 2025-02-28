<script lang="ts" setup>
  import { Config } from "@/api/settings.ts";
  import { getValidateImg, rtCode, userLogin } from "@/api/star_horse";
  import { JSEncrypt } from "jsencrypt";
  import { removeToken } from "@/utils/auth";
  import { onMounted, reactive, ref, watch } from "vue";
  import { RouteLocationNormalized, useRouter } from "vue-router";
  import type { ElForm, FormInstance, FormRules, TabsPaneContext } from "element-plus";
  import { warning } from "@/utils/message";
  import { i18n } from "@/lang";
  import { GlobalConfig } from "@/store/GlobalConfigStore.ts";
  import piniaInstance from "@/store";
  import { particlesCfg } from "@/api/particlesConfig.ts";

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
  let loginForm = reactive<LoginInfo>({
    password: "",
    rememberMe: "",
    tokenId: "",
    userName: "",
    uuid: "",
    validCode: ""
  });
  const loginFormRef = ref<FormInstance>();
  let router = useRouter();
  let showValid = ref<boolean>(false);
  let loginRules = reactive<FormRules<LoginInfo>>({
    userName: [{ required: true, trigger: "blur", message: i18n("login.userName", ["starhorse.notAllowEmpty"]) }],
    password: [{ required: true, trigger: "blur", message: i18n("login.password", ["starhorse.notAllowEmpty"]) }],
    validCode: [{ required: true, trigger: "blur", message: i18n("login.validCode", ["starhorse.notAllowEmpty"]) }]
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
  const handleLogin = async (elForm: FormInstance | undefined, event: Event) => {
    if (!elForm) return;
    event.preventDefault();
    event.stopPropagation();
    await elForm.validate(async (valid, _fields) => {
      if (valid) {
        loading.value = !loading.value;
        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicKey.value);
        const user = {
          userName: loginForm?.userName,
          password: loginForm?.password,
          rememberMe: loginForm?.rememberMe,
          tokenId: uuid.value,
          validCode: loginForm?.validCode,
          uuid: loginForm?.uuid
        };
        //密码加密传输，需要加密时去掉注释，单后端认证服务需支持
        user["password"] = <string>encrypt.encrypt(loginForm.password);
        if (valid) {
          let { errMsg } = await userLogin(user);
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
  };
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
      redirect.value = route.query && (route.query.redirect as string);
    },
    {
      deep: true,
      immediate: true
    }
  );
</script>
<template>
  <div class="login1">
    <vue-particles
      id="tsparticles"
      :particlesInit="particlesInit"
      :particlesLoaded="particlesLoaded"
      :options="particlesCfg"
    />
    <div class="loginav">
      <div class="loginbox boxall">
        <div class="logo">{{ Config.title }}</div>
        <div class="logintit"
          ><span>{{ i18n("loginButton.login") }}</span></div
        >
        <el-form
          :model="loginForm"
          :rules="loginRules"
          :size="'large'"
          class="logininput animate__animated animate__fadeIn"
          label-position="top"
          ref="loginFormRef"
        >
          <el-form-item prop="userName" :label="i18n('login.userName')" required>
            <el-input
              auto-complete="off"
              @keyup.enter="handleLogin(loginFormRef, $event)"
              :placeholder="i18n('starhorse.pleaseInput', 'login.userName')"
              prefix-icon="User"
              type="text"
              v-model="loginForm.userName"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="password" :label="i18n('login.password')" required>
            <el-input
              @keyup.enter.stop="handleLogin(loginFormRef, $event)"
              :prefix-icon="flag ? 'Unlock' : 'Lock'"
              auto-complete="off"
              :placeholder="i18n('starhorse.pleaseInput', 'login.password')"
              :type="flag ? 'text' : 'password'"
              v-model="loginForm.password"
            >
              <template #suffix>
                <el-icon @mousedown="getFlag" @mouseup="getFlag" style="cursor: pointer">
                  <component :is="flag ? 'view' : 'hide'" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="showValid" prop="validCode" :label="i18n('login.validCode')" required>
            <el-input
              @keyup.enter="handleLogin(loginFormRef, $event)"
              auto-complete="off"
              :placeholder="i18n('starhorse.pleaseInput', 'login.validCode')"
              style="width: 63%"
              prefix-icon="key"
              v-model="loginForm.validCode"
            >
            </el-input>
            <div class="login-code">
              <img :src="validateImg" @click="refreshValidate" />
            </div>
          </el-form-item>
          <el-row>
            <el-col :span="18">
              <el-checkbox size="large" v-model="loginForm.rememberMe">
                {{ i18n("login.rememberMe") }}
              </el-checkbox>
            </el-col>
            <el-col :span="6">
              <el-button link :size="Config.compSize"> {{ i18n("login.forget") }}</el-button>
            </el-col>
          </el-row>
          <el-form-item style="width: 100%; height: 50px">
            <el-button
              :loading="loading"
              @click.stop="handleLogin(loginFormRef, $event)"
              style="
                width: 100%;
                height: 50px;
                font-size: 16px;
                border: none;
                background: var(--star-horse-style);
                color: var(--star-horse-white);
              "
            >
              <span v-if="!loading">{{ i18n("loginButton.login") }}</span>
              <span v-else>{{ i18n("loginButton.logging") }}</span>
            </el-button>
          </el-form-item>
        </el-form>
        <div class="boxfoot"></div>
      </div>
    </div>
    <div class="copyright" style="color: var(--star-horse-white)">{{ i18n("starhorse.copyright") }}</div>
  </div>
</template>
<style lang="scss" scoped>
  @import "@/assets/css/login/style.css";

  .el-row {
    align-items: center;
  }

  :deep(.el-form-item__label),
  :deep(.el-checkbox__label),
  button.is-link {
    color: var(--star-horse-white) !important;
  }
</style>
