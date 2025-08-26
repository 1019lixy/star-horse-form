<script lang="ts" setup>
// import { particlesCfg } from '@/api/particlesConfig';
import { Config } from "@/api/settings";
import { getValidateImg, rtCode } from "@/api/star_horse_apis";
import { i18n } from "@/lang";
import { useLoginStore } from "@/store/Login";
import { removeToken, setPublicKey } from "@/utils/auth";
import type { FormInstance, FormRules, TabsPaneContext } from "element-plus";
import { JSEncrypt } from "jsencrypt";
import {
  piniaInstance,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import { onMounted, reactive, ref, watch } from "vue";
import { RouteLocationNormalized, useRouter } from "vue-router";

interface LoginInfo {
  userName: string;
  password: string;
  rememberMe: string;
  tokenId: string;
  validCode: string;
  uuid: string;
}
const loginStore = useLoginStore(piniaInstance);
let configStore = useGlobalConfigStore(piniaInstance);
let validateImg = ref<string>("");
let uuid = ref<string>("");
let flag = ref<boolean>(false);
let redirect = ref<string>("");
let publicKey = ref<string>("");
let loading = ref<boolean>(false);
let loginForm = reactive<LoginInfo>({
  password: "",
  rememberMe: "",
  tokenId: "",
  userName: "",
  uuid: "",
  validCode: "",
});
const loginFormRef = ref<FormInstance>();
let router = useRouter();
let showValid = ref<boolean>(false);
let loginRules = reactive<FormRules<LoginInfo>>({
  userName: [
    {
      required: true,
      trigger: "blur",
      message: i18n("login.userName", ["starhorse.notAllowEmpty"]),
    },
  ],
  password: [
    {
      required: true,
      trigger: "blur",
      message: i18n("login.password", ["starhorse.notAllowEmpty"]),
    },
  ],
  validCode: [
    {
      required: true,
      trigger: "blur",
      message: i18n("login.validCode", ["starhorse.notAllowEmpty"]),
    },
  ],
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
        uuid: loginForm?.uuid,
      };
      //密码加密传输，需要加密时去掉注释，单后端认证服务需支持
      user["password"] = <string>encrypt.encrypt(loginForm.password);
      if (valid) {
        let { errMsg } = await loginStore.userLogin(user);
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
    setPublicKey(record.publicKey);
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
const register = () => {};
/**
 * 其它方式登录
 * @param typeName
 */
const otherLogin = (typeName: string) => {
  console.log(typeName);
};
const particlesLoaded = async (container: any) => {
  console.log("Particles container loaded", container);
};
watch(
  () => router.currentRoute.value,
  (route: RouteLocationNormalized) => {
    redirect.value = route.query && (route.query.redirect as string);
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>
<template>
  <div class="relative min-h-screen flex">
    <div
      class="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-auto min-w-0 bg-white"
    >
      <div
        class="login-bg sm:w-1/2 xl:w-3/5 h-full hidden md:flex flex-auto items-center justify-center p-10 overflow-hidden bg-purple-900 text-white bg-no-repeat bg-cover relative"
      >
        <!--        <vue-particles
          id="tsparticles"
          @particlesLoaded="particlesLoaded"
          :options="particlesCfg"
        />-->
        <div
          class="absolute bg-gradient-to-b from-indigo-600 to-blue-500 opacity-75 inset-0 z-0"
        ></div>
        <div class="w-full max-w-2xl z-10">
          <div class="sm:text-4xl xl:text-5xl font-bold leading-tight mb-6">
            {{ i18n("loginButton.welcome") }}
          </div>
          <div
            class="sm:text-sm xl:text-md text-gray-200 font-normal"
            style="font-size: 14px; line-height: 30px"
          >
            {{ i18n("loginButton.description") }}
          </div>
        </div>
        <ul class="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <div
        class="md:flex md:items-center md:justify-center sm:w-auto md:h-full md:w-2/5 xl:w-2/5 p-8 md:p-10 lg:p-14 flex-col sm:rounded-lg md:rounded-none bg-white"
      >
        <div
          class="w-xl space-y-8 relative"
          style="position: relative; background: #fff"
        >
          <div class="text-center">
            <h2 class="mt-6 text-3xl font-bold text-gray-900">
              {{ i18n("loginButton.welcomeBack") }}
            </h2>
            <p class="mt-2 text-sm text-gray-500">
              {{ i18n("loginDev.thirdPartyLogin") }}
            </p>
          </div>
          <div class="flex flex-row justify-center items-center space-x-3">
            <div
              @click="otherLogin('qq')"
              class="w-11 h-11 items-center justify-center inline-flex rounded-2xl font-bold text-lg bg-blue-900 hover:shadow-lg cursor-pointer transition ease-in duration-300"
            >
              <img
                class="w-4 h-4"
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuY29tL3N2Z2pzIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeD0iMCIgeT0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBjbGFzcz0iIj48Zz48cGF0aCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGQ9Im0xNS45OTcgMy45ODVoMi4xOTF2LTMuODE2Yy0uMzc4LS4wNTItMS42NzgtLjE2OS0zLjE5Mi0uMTY5LTMuMTU5IDAtNS4zMjMgMS45ODctNS4zMjMgNS42Mzl2My4zNjFoLTMuNDg2djQuMjY2aDMuNDg2djEwLjczNGg0LjI3NHYtMTAuNzMzaDMuMzQ1bC41MzEtNC4yNjZoLTMuODc3di0yLjkzOWMuMDAxLTEuMjMzLjMzMy0yLjA3NyAyLjA1MS0yLjA3N3oiIGZpbGw9IiNmZmZmZmYiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIHN0eWxlPSIiIGNsYXNzPSIiPjwvcGF0aD48L2c+PC9zdmc+"
              />
            </div>
            <div
              @click="otherLogin('qq')"
              class="w-11 h-11 items-center justify-center inline-flex rounded-2xl font-bold text-lg text-white bg-blue-400 hover:shadow-lg cursor-pointer transition ease-in duration-300"
            >
              <img
                class="w-4 h-4"
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuY29tL3N2Z2pzIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeD0iMCIgeT0iMCIgdmlld0JveD0iMCAwIDY4MS4zMzQ2NCA2ODEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxwYXRoIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZD0ibTIwMC45NjQ4NDQgNTE1LjI5Mjk2OWMyNDEuMDUwNzgxIDAgMzcyLjg3MTA5NC0xOTkuNzAzMTI1IDM3Mi44NzEwOTQtMzcyLjg3MTA5NCAwLTUuNjcxODc1LS4xMTcxODgtMTEuMzIwMzEzLS4zNzEwOTQtMTYuOTM3NSAyNS41ODU5MzctMTguNSA0Ny44MjQyMTgtNDEuNTg1OTM3IDY1LjM3MTA5NC02Ny44NjMyODEtMjMuNDgwNDY5IDEwLjQ0MTQwNi00OC43NTM5MDcgMTcuNDYwOTM3LTc1LjI1NzgxMyAyMC42MzY3MTggMjcuMDU0Njg3LTE2LjIzMDQ2OCA0Ny44MjgxMjUtNDEuODk0NTMxIDU3LjYyNS03Mi40ODgyODEtMjUuMzIwMzEzIDE1LjAxMTcxOS01My4zNjMyODEgMjUuOTE3OTY5LTgzLjIxNDg0NCAzMS44MDg1OTQtMjMuOTE0MDYyLTI1LjQ3MjY1Ni01Ny45NjQ4NDMtNDEuNDAyMzQ0LTk1LjY2NDA2Mi00MS40MDIzNDQtNzIuMzY3MTg4IDAtMTMxLjA1ODU5NCA1OC42ODc1LTEzMS4wNTg1OTQgMTMxLjAzMTI1IDAgMTAuMjg5MDYzIDEuMTUyMzQ0IDIwLjI4OTA2MyAzLjM5ODQzNyAyOS44ODI4MTMtMTA4LjkxNzk2OC01LjQ4MDQ2OS0yMDUuNTAzOTA2LTU3LjYyNS0yNzAuMTMyODEyLTEzNi45MjE4NzUtMTEuMjUgMTkuMzYzMjgxLTE3Ljc0MjE4OCA0MS44NjMyODEtMTcuNzQyMTg4IDY1Ljg3MTA5MyAwIDQ1LjQ2MDkzOCAyMy4xMzY3MTkgODUuNjA1NDY5IDU4LjMxNjQwNyAxMDkuMDgyMDMyLTIxLjUtLjY2MDE1Ni00MS42OTUzMTMtNi41NjI1LTU5LjM1MTU2My0xNi4zODY3MTktLjAxOTUzMS41NTA3ODEtLjAxOTUzMSAxLjA4NTkzNy0uMDE5NTMxIDEuNjcxODc1IDAgNjMuNDY4NzUgNDUuMTcxODc1IDExNi40NjA5MzggMTA1LjE0NDUzMSAxMjguNDY4NzUtMTEuMDE1NjI1IDIuOTk2MDk0LTIyLjYwNTQ2OCA0LjYwOTM3NS0zNC41NTg1OTQgNC42MDkzNzUtOC40Mjk2ODcgMC0xNi42NDg0MzctLjgyODEyNS0yNC42MzI4MTItMi4zNjMyODEgMTYuNjgzNTk0IDUyLjA3MDMxMiA2NS4wNjY0MDYgODkuOTYwOTM3IDEyMi40MjU3ODEgOTEuMDIzNDM3LTQ0Ljg1NTQ2OSAzNS4xNTYyNS0xMDEuMzU5Mzc1IDU2LjA5NzY1Ny0xNjIuNzY5NTMxIDU2LjA5NzY1Ny0xMC41NjI1IDAtMjEuMDAzOTA2LS42MDU0NjktMzEuMjYxNzE4OC0xLjgxNjQwNyA1Ny45OTk5OTk4IDM3LjE3NTc4MSAxMjYuODcxMDkzOCA1OC44NzEwOTQgMjAwLjg4NjcxODggNTguODcxMDk0IiBmaWxsPSIjZmZmZmZmIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBzdHlsZT0iIj48L3BhdGg+PC9nPjwvc3ZnPg=="
              />
            </div>
            <div
              @click="otherLogin('qq')"
              class="w-11 h-11 items-center justify-center inline-flex rounded-2xl font-bold text-lg text-white bg-blue-500 hover:shadow-lg cursor-pointer transition ease-in duration-300"
            >
              <img
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuY29tL3N2Z2pzIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeD0iMCIgeT0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGQ9Im0yMy45OTQgMjR2LS4wMDFoLjAwNnYtOC44MDJjMC00LjMwNi0uOTI3LTcuNjIzLTUuOTYxLTcuNjIzLTIuNDIgMC00LjA0NCAxLjMyOC00LjcwNyAyLjU4N2gtLjA3di0yLjE4NWgtNC43NzN2MTYuMDIzaDQuOTd2LTcuOTM0YzAtMi4wODkuMzk2LTQuMTA5IDIuOTgzLTQuMTA5IDIuNTQ5IDAgMi41ODcgMi4zODQgMi41ODcgNC4yNDN2Ny44MDF6IiBmaWxsPSIjZmZmZmZmIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBzdHlsZT0iIj48L3BhdGg+PHBhdGggeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkPSJtLjM5NiA3Ljk3N2g0Ljk3NnYxNi4wMjNoLTQuOTc2eiIgZmlsbD0iI2ZmZmZmZiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgc3R5bGU9IiI+PC9wYXRoPjxwYXRoIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZD0ibTIuODgyIDBjLTEuNTkxIDAtMi44ODIgMS4yOTEtMi44ODIgMi44ODJzMS4yOTEgMi45MDkgMi44ODIgMi45MDkgMi44ODItMS4zMTggMi44ODItMi45MDljLS4wMDEtMS41OTEtMS4yOTItMi44ODItMi44ODItMi44ODJ6IiBmaWxsPSIjZmZmZmZmIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBzdHlsZT0iIj48L3BhdGg+PC9nPjwvc3ZnPg=="
                class="w-4 h-4"
              />
            </div>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <span class="h-px w-16 bg-gray-200"></span>
            <span class="text-gray-300 font-normal">{{
              i18n("loginButton.login")
            }}</span>
            <span class="h-px w-16 bg-gray-200"></span>
          </div>

          <el-form
            :model="loginForm"
            :rules="loginRules"
            :size="'large'"
            class="mt-8 space-y-6"
            label-position="top"
            ref="loginFormRef"
          >
            <el-form-item
              prop="userName"
              :label="i18n('login.userName')"
              required
            >
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
            <el-form-item
              prop="password"
              :label="i18n('login.password')"
              required
            >
              <el-input
                @keyup.enter.stop="handleLogin(loginFormRef, $event)"
                :prefix-icon="flag ? 'Unlock' : 'Lock'"
                auto-complete="off"
                :placeholder="i18n('starhorse.pleaseInput', 'login.password')"
                :type="flag ? 'text' : 'password'"
                v-model="loginForm.password"
              >
                <template #suffix>
                  <el-icon
                    @mousedown="getFlag"
                    @mouseup="getFlag"
                    style="cursor: pointer"
                  >
                    <component :is="flag ? 'view' : 'hide'" />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item
              v-if="showValid"
              prop="validCode"
              :label="i18n('login.validCode')"
              required
            >
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
                <el-button
                  link
                  :size="Config.compSize"
                  class="items-center justify-center"
                >
                  {{ i18n("login.forget") }}
                </el-button>
              </el-col>
            </el-row>
            <el-form-item class="h-50">
              <el-button
                :loading="loading"
                @click.stop="handleLogin(loginFormRef, $event)"
                class="flex h-50 justify-center bg-gradient-to-r from-indigo-500 to-blue-600 bg-purple-900 hover:bg-gradient-to-l hover:from-blue-500 hover:to-indigo-600 text-gray-100 p-4 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-500"
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
            <div
              class="flex items-center justify-center mt-10 text-center text-md text-gray-500"
            >
              <span>{{ i18n("login.noAccount") }}</span>
              <div
                @click="register"
                class="text-indigo-400 hover:text-blue-500 no-underline hover:underline cursor-pointer transition ease-in duration-300"
              >
                {{ i18n("loginButton.register") }}
              </div>
            </div>
          </el-form>
        </div>
        <div
          class="copyright items-center justify-center"
          style="position: absolute; bottom: 5px"
        >
          {{ i18n("starhorse.copyright") }}
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@/assets/css/login1/css/style.css";

.login-bg {
  background-image: url("@/assets/css/login1/image/img.jpg");
  position: relative;
}
</style>
