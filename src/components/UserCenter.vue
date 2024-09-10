<script setup lang="ts">

import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {getUserInfo} from "../utils/auth.ts";
import {onMounted, reactive, ref} from "vue";
import {copy} from "@/api/sh_api.ts";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {initSelectData, userEditFieldInfo} from "@/views/system/utils/UserFields.ts";
import {postRequest} from "@/api/star_horse.ts";
import {success, warning} from "@/utils/message.ts";

let userInfo = ref<any>({});
let depts = ref<string>("--");
let roles = ref<string>("--");
const userFormRef = ref();
const baseFieldList = reactive<PageFieldInfo | any>({
  fieldList: [{
    fieldName: "basic",
    tabList: [
      {
        title: "基本资料",
        tabName: "basic",
        objectName: "basicUserInfo",
        fieldList: userEditFieldInfo
      },
      {
        title: "修改密码",
        tabName: "password",
        objectName: "passwordInfo",
        fieldList: [
          {
            label: "原始密码", fieldName: "oldPassword", type: "password",
            required: true, formShow: true,
          },
          {
            label: "新密码", fieldName: "password", type: "password",
            required: true, formShow: true,
          },
          {
            label: "确认密码", fieldName: "rePassword", type: "password",
            required: true, formShow: true,
          }
        ]
      },
      {
        title: "个人权限",
        tabName: "authority",
        objectName: "authorityInfo",
        fieldList: [
          {
            label: "权限",
            fieldName: "username",
            type: "input",
            required: true,
            formShow: true,
          }
        ]
      }
    ]
  }]
});

const doModifyUserInfo =async () => {
  let dataForm = userFormRef.value.getFormData()?.value;
  postRequest("/system-config/system/usersAuditEntity/refreshInvalidPassword/" + dataForm.username +
      "/" + dataForm.password + "/" + (dataForm.oldPassword || "0") + "/" + dataForm.phone, {})
      .then(res => {
        let redata = res.data;
        if (redata.code != 0) {
          warning(redata.cnMessage);
          return;
        }
        success(redata.cnMessage);
        dialogProps.editVisible = false;
      });
};
/**
 * 重置表单
 */
const resetForm = () => {
  let dataForm: any = {};
  dataForm["username"] = userInfo.value?.username;
  dataForm["employeeNo"] = userInfo.value?.employeeNo;
  editUserinfoRef.value.setFormData(dataForm);
};
const init = async () => {
  userInfo.value = getUserInfo();
  await initSelectData();
  depts.value = userInfo.value.deptList?.map((item: any) => {
    return item.deptName
  }).join(";");
  roles.value = userInfo.value.rolesList?.map((item: any) => {
    return item.roleName
  }).join(";");
  console.log(userInfo.value, depts.value);
}
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
              <span>个人信息</span>
            </div>
          </template>
          <div class="avatar">
            <el-avatar shape="square" :size="100" :fit="'cover'"
                       :src="'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'"/>
          </div>
          <div class="details">
            <ul>
              <li>
                <div>
                  <star-horse-icon icon-class="user-circle"/>
                  用户名/姓名/工号
                </div>
                <div>{{ userInfo.username }}/{{ userInfo.name || "--" }}/{{ userInfo.employeeNo || "--" }}</div>
              </li>
              <li>
                <div>
                  <star-horse-icon icon-class="phone"/>
                  联系电话
                </div>
                <div class="pointer" @click="copy(userInfo.phone)">{{ userInfo.phone || "--" }}</div>
              </li>
              <li>
                <div>
                  <star-horse-icon icon-class="email"/>
                  邮箱
                </div>
                <div class="pointer" @click="copy(userInfo.email)">{{ userInfo.email || "--" }}</div>
              </li>
              <li>
                <div>
                  <star-horse-icon icon-class="dept"/>
                  所属部门
                </div>
                <div>{{ depts }}</div>
              </li>
              <li>
                <div>
                  <star-horse-icon icon-class="role"/>
                  系统角色
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
              <span>基本信息</span>
              <el-button type="primary" @click="doModifyUserInfo">
                <star-horse-icon icon-class="save" color="var(--star-horse-white)"/>
                保存
              </el-button>
            </div>
          </template>
          <div class="base-info-form">
            <star-horse-form :fieldList="baseFieldList" ref="userFormRef"/>
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
          border-bottom: 1px solid var(--star-horse-font-color);
        }
      }
    }
  }

  .base-info {
    margin-left: 15px;
    flex: 1;

    .base-info-form {
      padding: 0 15px;
    }
  }
}
</style>
