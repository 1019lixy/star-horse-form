<script lang="ts" setup>
import {Config} from "@/api/settings";
import {getValidateImg, userLogin} from "@/api/star_horse_apis";
import {JSEncrypt} from "jsencrypt";
import {onMounted, reactive, ref, watch, computed} from "vue";
import {useRouter} from "vue-router";
import type {ElForm, FormInstance, FormRules} from "element-plus";
import {warning} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {useUserInfoStore, piniaInstance} from "star-horse-lowcode";
import {setPublicKey} from "@/utils/auth";

interface LoginInfo {
  userName: string;
  password: string;
  rememberMe: string;
  tokenId: string;
  validCode: string;
  uuid: string;
}

const {currentRoute, replace} = useRouter();
const loginDialogVisible = defineModel<boolean>("loginDialogVisible")
const userInfoStore = useUserInfoStore(piniaInstance);
const dialogVisible = computed(() => loginDialogVisible.value && currentRoute.value.path != "/login");
let validateImg = ref<string>("");
let uuid = ref<string>("");
let flag = ref<boolean>(false);
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
let showValid = ref<boolean>(false);
let loginRules = reactive<FormRules<LoginInfo>>({
  userName: [{required: true, trigger: "blur", message: i18n("login.userName", ["starhorse.notAllowEmpty"])}],
  password: [{required: true, trigger: "blur", message: i18n("login.password", ["starhorse.notAllowEmpty"])}],
  validCode: [{required: true, trigger: "blur", message: i18n("login.validCode", ["starhorse.notAllowEmpty"])}]
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
        let {errMsg} = await userLogin(user);
        if (errMsg) {
          warning(errMsg);
          refreshValidate();
          loading.value = false;
        } else {
          loading.value = !loading.value;
          const {query, fullPath} = currentRoute.value;
          query["redirectPath"] = fullPath;
          await replace({
            path: "/redirect",
            query: query
          });
          handleClose();
        }
      }
    }
  });
};
const refreshValidate = () => {
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
});
watch(
    () => loginDialogVisible.value,
    (val) => {
      if (val) {
        refreshValidate();
      }
    }, {immediate: true, deep: true}
)
/**
 * 其它方式登录
 * @param typeName
 */
const handleClose = () => {
  userInfoStore.closeLoginDialog();
};

</script>
<template>
  <star-horse-dialog :selfFunc="true" :isView="true" :dialogVisible="dialogVisible" title="超时登录"
                     :box-width="'400px'"
                     :hideFullScreenIcon="true"
                     @closeAction="handleClose">
    <el-form
        :model="loginForm"
        :rules="loginRules"
        :size="'default'"
        class="w-full "
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
              <component :is="flag ? 'view' : 'hide'"/>
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
          <img :src="validateImg" @click="refreshValidate"/>
        </div>
      </el-form-item>
      <el-row class="w-[100%]">
        <el-col :span="18">
          <el-checkbox size="large" v-model="loginForm.rememberMe">
            {{ i18n("login.rememberMe") }}
          </el-checkbox>
        </el-col>
        <el-col :span="6">
          <el-button link :size="Config.compSize"> {{ i18n("login.forget") }}</el-button>
        </el-col>
      </el-row>
      <el-form-item class="w-full items-center justify-center">
        <el-button
            :loading="loading"
            @click.stop="handleLogin(loginFormRef, $event)"
            style="
                width: 100%;
                height: 40px;
                font-size: 16px;
                border: none;
                background: var(--star-horse-style);
                color: var(--star-horse-white);
              ">
          <span v-if="!loading">{{ i18n("loginButton.login") }}</span>
          <span v-else>{{ i18n("loginButton.logging") }}</span>
        </el-button>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>
<style lang="scss" scoped>
@import "@/assets/css/login/style.css";

.el-row {
  align-items: center;
}

</style>
