<script lang="ts" setup>
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { i18n } from "@/lang";
import { useRouter } from "vue-router";

interface ForgotPasswordInfo {
  email: string;
  validCode: string;
}

const router = useRouter();
const forgotPasswordFormRef = ref<FormInstance>();
const forgotPasswordForm = reactive<ForgotPasswordInfo>({
  email: "",
  validCode: "",
});

const loading = ref<boolean>(false);
const showValid = ref<boolean>(true);
const validateImg = ref<string>("");
const uuid = ref<string>("");
const resetSuccess = ref<boolean>(false);

// Validation rules
const forgotPasswordRules = reactive<FormRules<ForgotPasswordInfo>>({
  email: [
    {
      required: true,
      trigger: "blur",
      message: i18n("system.email", ["starhorse.notAllowEmpty"]),
    },
    {
      type: "email",
      message:
        i18n("system.email") + " " + i18n("utils.warning.provideCorrectData"),
      trigger: ["blur", "change"],
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

// Handle forgot password
const handleForgotPassword = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      // Simulate forgot password API call
      setTimeout(() => {
        loading.value = false;
        resetSuccess.value = true;
      }, 1500);
    }
  });
};

// Refresh validation code
const refreshValidate = () => {
  // In a real implementation, this would call an API to get a new validation image
  console.log("Refreshing validation code");
};

// Go back to login
const goBackToLogin = () => {
  router.push("/login");
};

// Reset form for another attempt
const resetForm = () => {
  resetSuccess.value = false;
  forgotPasswordForm.email = "";
  forgotPasswordForm.validCode = "";
};

// Initialize with a validation code
refreshValidate();
</script>

<template>
  <div class="relative min-h-screen flex">
    <div
      class="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-auto min-w-0 bg-white"
    >
      <div
        class="login-bg sm:w-1/2 xl:w-3/5 h-full hidden md:flex flex-auto items-center justify-center p-10 overflow-hidden bg-purple-900 text-white bg-no-repeat bg-cover relative"
      >
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
              {{ i18n("login.forget") }}
            </h2>
            <p class="mt-2 text-sm text-gray-500">
              {{ i18n("forgotPassword.title") }}
            </p>
          </div>

          <!-- Success message -->
          <div v-if="resetSuccess" class="mt-8 p-4 bg-green-50 rounded-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                  {{ i18n("forgotPassword.success") }}
                </h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>
                    {{ i18n("forgotPassword.checkEmail") }}
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <el-button @click="resetForm" type="primary" class="w-full">
                {{ i18n("login.forget") }} {{ i18n("system.password") }}
              </el-button>
              <el-button @click="goBackToLogin" link class="w-full mt-2">
                {{ i18n("loginButton.login") }}
              </el-button>
            </div>
          </div>

          <!-- Forgot password form -->
          <el-form
            v-else
            :model="forgotPasswordForm"
            :rules="forgotPasswordRules"
            :size="'large'"
            class="mt-8 space-y-6"
            label-position="top"
            ref="forgotPasswordFormRef"
          >
            <el-alert
              :title="i18n('forgotPassword.tip')"
              type="info"
              :closable="false"
              class="mb-4"
            />

            <el-form-item prop="email" :label="i18n('register.email')" required>
              <el-input
                auto-complete="off"
                :placeholder="i18n('starhorse.pleaseInput', 'register.email')"
                prefix-icon="Message"
                type="email"
                v-model="forgotPasswordForm.email"
              >
              </el-input>
            </el-form-item>

            <el-form-item
              v-if="showValid"
              prop="validCode"
              :label="i18n('login.validCode')"
              required
            >
              <el-input
                auto-complete="off"
                :placeholder="i18n('starhorse.pleaseInput', 'login.validCode')"
                style="width: 63%"
                prefix-icon="key"
                v-model="forgotPasswordForm.validCode"
              >
              </el-input>
              <div class="login-code">
                <img :src="validateImg" @click="refreshValidate" />
              </div>
            </el-form-item>

            <el-form-item class="h-50">
              <el-button
                :loading="loading"
                @click="handleForgotPassword(forgotPasswordFormRef)"
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
                <span v-if="!loading">{{ i18n("login.forget") }}</span>
                <span v-else>{{ i18n("loginButton.logging") }}</span>
              </el-button>
            </el-form-item>

            <div
              class="flex items-center justify-center mt-10 text-center text-md text-gray-500"
            >
              <span>{{ i18n("login.remember.password") }}</span>
              <div
                @click="goBackToLogin"
                class="text-indigo-400 hover:text-blue-500 no-underline hover:underline cursor-pointer transition ease-in duration-300"
              >
                {{ i18n("loginButton.login") }}
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
