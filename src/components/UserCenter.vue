<script setup lang="ts">
import { getPublicKey, getUserInfo } from "@/utils/auth";
import { computed, onMounted, provide, reactive, ref } from "vue";
import {
  copy,
  dialogPreps,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  StarHorseForm,
  success,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import {
  initSelectData,
  userEditFieldInfo,
} from "@/views/system/utils/UserFields";
import { Config } from "@/api/settings";
import { JSEncrypt } from "jsencrypt";
import { ServiceEnums } from "@/components/enums/ServiceEnums";
import { i18n } from "@/lang";
let userInfo = ref<any>({});
let depts = ref<string>("--");
let roles = ref<string>("--");
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
const userFormRef = ref<Record<string, InstanceType<typeof StarHorseForm>>>({}); // 明确组件类型
const activeName = ref<string>("basic");
const url: any = {
  basic: `${ServiceEnums.SYSTEM_PREFIX}usersinfo/userSelfEdit`,
  password: `${ServiceEnums.SYSTEM_PREFIX}usersAudit/editPassword`,
};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const baseFieldList = reactive<PageFieldInfo | any>({
  fieldList: userEditFieldInfo,
});
const passwordFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: i18n("userCenter.oldPassword"),
      fieldName: "oldPassword",
      type: "password",
      required: true,
      formVisible: true,
    },
    {
      label: i18n("userCenter.newPassword"),
      fieldName: "password",
      type: "password",
      rules: [
        "password",
        {
          name: "dataLength",
          options: {
            min: 6,
            max: 14,
          },
        },
        {
          trigger: "blur",
          validator(_rule: any, value: any, callback: Function) {
            const formData =
              userFormRef.value[activeName.value].getFormData()?.value;
            if (value == formData.oldPassword) {
              callback(new Error(i18n("userCenter.passwordSameError")));
            } else {
              callback();
            }
          },
        },
      ],
      required: true,
      formVisible: true,
    },
    {
      label: i18n("userCenter.confirmPassword"),
      fieldName: "confirmPassword",
      type: "password",
      rules: [
        {
          trigger: "blur",
          validator(_rule: any, value: any, callback: Function) {
            const formData =
              userFormRef.value[activeName.value].getFormData()?.value;
            if (value !== formData.password) {
              callback(new Error(i18n("userCenter.passwordMismatchError")));
            } else {
              callback();
            }
          },
        },
      ],
      required: true,
      formVisible: true,
    },
  ],
});

const doModifyUserInfo = async () => {
  const currentForm: any = userFormRef.value[activeName.value];
  if (!currentForm) return;
  let validateResult: boolean =
    await currentForm.$refs.starHorseFormRef.validate();
  if (!validateResult) return;
  let dataForm = currentForm.getFormData()?.value;
  console.log(dataForm);
  if (activeName.value == "password") {
    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(getPublicKey()!);
    dataForm["oldPassword"] = encrypt.encrypt(dataForm["oldPassword"]);
    dataForm["password"] = encrypt.encrypt(dataForm["password"]);
    dataForm["confirmPassword"] = encrypt.encrypt(dataForm["confirmPassword"]);
  }
  postRequest(url[activeName.value], dataForm).then((res) => {
    let redata = res.data;
    if (redata.code != 0) {
      warning(redata.cnMessage);
      return;
    }
    success(redata.cnMessage);
  });
};
/**
 * 重置表单
 */
const resetForm = () => {
  let dataForm: any = {};
  dataForm["username"] = userInfo.value?.username;
  dataForm["employeeNo"] = userInfo.value?.employeeNo;
  userFormRef.value[activeName.value].setFormData(dataForm);
};
const setRef =
  (name: string) => (el: InstanceType<typeof StarHorseForm> | null) => {
    if (el) {
      userFormRef.value[name] = el;
    }
  };
const init = async () => {
  userInfo.value = getUserInfo();
  await initSelectData();
  dialogProps.ids = userInfo.value.idUsersinfo;
  depts.value = userInfo.value.deptList
    ?.map((item: any) => {
      return item.deptName;
    })
    .join(";");
  roles.value = userInfo.value.rolesList
    ?.map((item: any) => {
      return item.roleName;
    })
    .join(";");
};
onMounted(async () => {
  await init();
});
</script>

<template>
  <el-card class="inner_content">
    <div class="userinfo">
      <div class="self-info">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ i18n("userCenter.personalInfo") }}</span>
            </div>
          </template>
          <div class="avatar">
            <el-avatar
              shape="square"
              :size="100"
              :fit="'cover'"
              :src="ServiceEnums.SYSTEM_SERVICE + userInfo.photoUrl"
            />
          </div>
          <div class="details">
            <ul>
              <li>
                <div class="li-label">
                  <star-horse-icon icon-class="user-circle" />
                  {{ i18n("userCenter.usernameNameEmployeeNo") }}
                </div>
                <div>
                  {{ userInfo.username }}/{{ userInfo.name || "--" }}/{{
                    userInfo.employeeNo || "--"
                  }}
                </div>
              </li>
              <li>
                <div class="li-label">
                  <star-horse-icon icon-class="phone" />
                  {{ i18n("userCenter.phone") }}
                </div>
                <div class="pointer" @click="copy(userInfo.phone)">
                  {{ userInfo.phone || "--" }}
                </div>
              </li>
              <li>
                <div class="li-label">
                  <star-horse-icon icon-class="email" />
                  {{ i18n("userCenter.email") }}
                </div>
                <div class="pointer" @click="copy(userInfo.email)">
                  {{ userInfo.email || "--" }}
                </div>
              </li>
              <li>
                <div class="li-label">
                  <star-horse-icon icon-class="dept" />
                  {{ i18n("userCenter.dept") }}
                </div>
                <div>{{ depts }}</div>
              </li>
              <li>
                <div class="li-label">
                  <star-horse-icon icon-class="role" />
                  {{ i18n("userCenter.role") }}
                </div>
                <div>{{ roles }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </div>
      <div class="base-info">
        <el-card style="width: 100%">
          <template #header>
            <div class="card-header">
              <span>{{ i18n("userCenter.basicInfo") }}</span>
              <el-button
                :size="compSize"
                type="primary"
                @click="doModifyUserInfo"
              >
                <star-horse-icon
                  icon-class="save"
                  color="var(--star-horse-white)"
                />
                {{ i18n("userCenter.save") }}
              </el-button>
            </div>
          </template>
          <div class="base-info-form">
            <el-tabs v-model="activeName">
              <el-tab-pane :label="i18n('userCenter.basicData')" name="basic">
                <star-horse-form
                  :outerFormData="userInfo"
                  :fieldList="baseFieldList"
                  :ref="setRef('basic')"
                />
              </el-tab-pane>
              <el-tab-pane
                :label="i18n('userCenter.changePassword')"
                name="password"
              >
                <star-horse-form
                  :fieldList="passwordFieldList"
                  :ref="setRef('password')"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.userinfo {
  display: flex;
  height: 100%;

  .self-info {
    width: 30%;

    .avatar {
      margin: 5px auto;
    }

    .details {
      margin: 0 10px;

      ul {
        list-style: none;
        width: 100%;

        li {
          display: inline-flex;
          line-height: 40px;
          height: 40px;
          width: 100%;
          font-size: 13px;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px dashed var(--star-horse-shadow);

          &:hover {
            background-color: var(--star-horse-shadow);
          }

          .li-label {
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }

  .base-info {
    margin-left: 15px;
    flex: 1;

    .base-info-form {
      padding: 0 15px;
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>
