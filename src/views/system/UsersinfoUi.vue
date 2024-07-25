<script setup lang="ts" name="Usersinfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {DialogProps} from "@/components/types/DialogProps"
import {nextTick, onMounted, provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {
  createCondition,
  dictData,
  getMenuId, loadById,
  loadDepartmentInfo,
  loadPagePermission,
  loadRolesInfo
} from "@/api/sh_api";
import {analysisData} from "@/api/deptment";
import {ElTreeV2} from "element-plus";
import {TreeNode, TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {SearchParams} from "@/components/types/Params";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {postRequest, trim} from "@/api/star_horse.ts";
import {success, warning} from "@/utils/message.ts";
const props = defineProps({
  viewRolesinfoId: {type: String},
  disableAction: {type: Boolean, default: false}
});
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/usersinfoEntity/pageList",
  mergeUrl: "/system-config/system/usersinfoEntity/merge",
  mergeDraftUrl: "/system-config/system/usersinfoEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/usersinfoEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/usersinfoEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/usersinfoEntity/getById",
  deleteUrl: "/system-config/system/usersinfoEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/usersinfoEntity/exportData",
  downloadTemplateUrl: "/system-config/system/usersinfoEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/usersinfoEntity/getAllByCondition",
  importUrl: "/system-config/system/usersinfoEntity/importData",
  uploadUrl: "",
  condition: []
};
// const nativePlaceList = ref<any>([]);
// const educationList = ref<SelectOption[]>([]);
// const politicalStatusList = ref<SelectOption[]>([]);
// const identityTypeList = ref<SelectOption[]>([]);
const sexList = ref([{name: "男", value: 1}, {name: "女", value: 2}, {name: "保密", value: 3}]);
const rolesList = ref<SelectOption[]>([]);
const deptList = ref<SelectOption[]>([]);
const usersinfoTableListRef = ref();
const statusList = ref<SelectOption[]>([]);
const searchFormData = reactive<SearchProps[]>([
  {label: "姓名", fieldName: "name", defaultShow: true, type: "input", matchType: "lk"},
  {label: "用户名", fieldName: "username", defaultShow: true, type: "input", matchType: "lk"},
  {label: "员工编号", fieldName: "employeeNo", defaultShow: true, type: "input", matchType: "lk"},
  {
    label: "角色",
    fieldName: "idRolesinfo",
    type: "select",
    prefix: "b",
    defaultValue: props.viewRolesinfoId,
    optionList: rolesList,
    disabled: props.viewRolesinfoId ? true : false
  },
  {label: "性别", fieldName: "sex", type: "select", optionList: sexList},
]);
//修改密码方法
const ruleForm = ref<any>({});
const pwdFormRef = ref();
const dialogPwdVisible = ref<boolean>(false);
const resetForm = () => {
  let data = pwdFormRef.value.getFormData();
  data.password = "";
  data.rePassword = "";
  // ruleForm.value = {};
}
const pwdMerge = () => {
  pwdFormRef.value.$refs.starHorseFormRef.validate((valid: any) => {
    if (!valid) {
      return;
    }
    let pwdForm = pwdFormRef.value.getFormData().value;
    console.log(pwdForm);
    let pwd = pwdForm.password;
    let rePwd = pwdForm.rePassword;
    if (!trim(pwd)) {
      warning("不能设置空格密码");
      return;
    }
    if (pwd.length < 6 || pwd.length > 15) {
      warning("请设置长度为6到15的密码");
      return;
    }
    if (pwd !== rePwd) {
      warning("两次密码不一致，请重新录入");
      return;
    }
    postRequest("/system-config/system/usersAuditEntity/refreshInvalidPassword/" + pwdForm.username
        + "/" + pwd + "/" + (pwdForm.oldPassword || "0") + "/" + pwdForm.phone, {}).then(res => {
      let redata = res.data;
      if (redata.code == 1) {
        warning(redata.cnMessage);
        return;
      }
      success(redata.cnMessage);
      dialogProps.bakeVisible3 = false;
    });
  });
}
const editPwd = async (row: any) => {
  let data = await loadById(dataUrl.loadByIdUrl, row[primaryKey], false, {});
  dialogProps.bakeVisible3 = true;
  await nextTick();
  pwdFormRef.value.setDataForm(data);
};
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [{
      label: "用户名", fieldName: "username", type: "input",
      required: true, formShow: true, disabled: "Y",
      tableShow: true
    }, {
      label: "员工编号", fieldName: "employeeNo", type: "input",
      required: true, formShow: true,
      tableShow: true
    }],
    [{
      label: "归属部门", fieldName: "deptList", type: "cascade", optionList: deptList,
      required: true, formShow: true, multiple: "Y",
      tableShow: true
    }, {
      label: "角色", fieldName: "rolesList", type: "select", optionList: rolesList,
      required: true, formShow: true, multiple: "Y",
      tableShow: true
    }],
    [
      {
        label: "邮箱地址", fieldName: "email", type: "input",
        required: true, formShow: true,
        tableShow: true
      },
      {
        label: "联系电话", fieldName: "phone", type: "input",
        required: true, formShow: true,
        tableShow: true
      }],
    [
      {
        label: "姓名", fieldName: "name", type: "input",
        required: true, formShow: true,
        tableShow: true
      },
      {
        label: "性别", fieldName: "sex", type: "select", optionList: sexList,
        formShow: true,
        tableShow: true
      }],
    /*
     {
      label: "紧急联系人电话", fieldName: "bakePhone", type: "input",
    },
    {
      label: "学历", fieldName: "education", type: "select", optionList: educationList.value,
       formShow: true,
      tableShow: true
    },
    [{
      label: "入职时间", fieldName: "entryDate", type: "date",
    },
      {
        label: "离职时间", fieldName: "leaveDate", type: "date",
      }],
    {
      label: "籍贯", fieldName: "nativePlace", type: "select", optionList: nativePlaceList.value,
       formShow: true,
      tableShow: true
    },
    {
      label: "政治面貌", fieldName: "politicalStatus", type: "select", optionList: politicalStatusList.value,
       formShow: true,
      tableShow: true
    },
    {
      label: "证件类型", fieldName: "identityType", type: "select", optionList: identityTypeList.value,
       formShow: true,
      tableShow: true
    },
    {
      label: "证件编号", fieldName: "identityNo", type: "input",
       formShow: true,
      tableShow: true
    },*/
    [{
      label: "状态", fieldName: "statusCode", type: "select",
      formShow: true,
      optionList: statusList,
    },
      {
        label: "通信地址", fieldName: "address", type: "input",
        formShow: true,
        tableShow: true
      }],
    {
      label: "备注", fieldName: "remark", type: "textarea",
      formShow: true,
      tableShow: true
    },
    {
      label: "证件照", fieldName: "imagePath", type: "input",
    },
    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
      tableShow: true
    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
    },
    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
      tableShow: true
    },
    {
      label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
    },
    {
      label: "是否已逻辑删除", fieldName: "isDel", type: "number",
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
    },
    {
      label: "状态", fieldName: "statusName", type: "input",
      tableShow: true
    },
    {
      label: "国际码", fieldName: "local", type: "input",
    },
  ],
  stopAutoLoad: props.viewRolesinfoId ? true : false,
  userTableFuncs: [{
    authority: "edit",
    btnName: "修改密码",
    funcName: (row: any) => {
      editPwd(row);
    }
  }]
});
const primaryKey = "idUsersinfo";
const rules = {};
const dataForm = ref({});
provide("dataForm", dataForm);
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false
});
provide("dialogProps", dialogProps);
let permissions = ref<any>({});
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "sex") {
    let fdata = sexList.value.find((item: any) => parseInt(item.value) == parseInt(cellValue));
    return fdata?.name || cellValue;
  }
  if (name == "rolesList" && row["rolesList"]) {
    let roles: Array<String> = [];
    row["rolesList"].forEach((item: any) => {
      roles.push(item.roleName);
    });
    return roles.join(";");
  }
  if (name == "deptList" && row['deptList']) {
    let data = analysisData(row['deptList'], "", "deptName", "idDepartment")
    return data.listNames.join("/");
  }
  return cellValue;
};
const treeRef = ref<InstanceType<typeof ElTreeV2>>();
const query = ref('');
const onQueryChanged = (query: string) => {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  treeRef.value!.filter(query)
};
const filterMethod = (query: string, node: TreeNode) => {
  return node.name.toLowerCase()!.includes(query?.toLowerCase())
};
/**
 * 点击事件
 * @param data
 * @param checked
 */
const checkChange = (data: TreeNodeData, checked: boolean) => {
  // let checkedNodes = treeRef.value.getCheckedNodes();
  // if (checkedNodes?.length > 0) {
  //   checkedNodes.forEach(item => {
  //     treeRef.value.setChecked(item.value, false);
  //   });
  // }
  // treeRef.value.setChecked(data.value, (checked instanceof Boolean) ? checked : true);
  let conditions: Array<SearchParams> = [];
  if (checked) {
    console.log(data.value);
    conditions.push(createCondition("c.idDepartment", data.value));
  }
  // menuTableListRef.value.setDataInfo(conditions, null);
  usersinfoTableListRef.value.createCreateParams(conditions);
};
const searchData = (data: SearchParams[]) => {
  usersinfoTableListRef.value.createCreateParams(data);
};
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId())
  rolesList.value = await loadRolesInfo([]);
  deptList.value = await loadDepartmentInfo([]);
  statusList.value = await dictData("common");
  //如果是从其它页面加载的该页面，则将条件加入查询
  if (props.viewRolesinfoId) {
    await nextTick(() => {
      usersinfoTableListRef.value.createCreateParams(searchFormData);
      // usersinfoTableListRef.value.loadByPage();
    });
  }
};
onMounted(async () => {
  await initData();
});
const pwdFieldInfo = reactive<PageFieldInfo | any>({
  fieldList: [[{
    label: "工号", fieldName: "employeeNo", type: "text",
    formShow: true
  }, {
    label: "用户名", fieldName: "username", type: "text",
    formShow: true
  }], [{
    label: "密码", fieldName: "password", type: "password",
    formShow: true
  }, {
    label: "确认密码", fieldName: "rePassword", type: "password",
    formShow: true
  }]]
});
</script>
<template>
  <star-horse-dialog
      :dialog-visible="dialogProps.bakeVisible3"
      :is-show-reset="false"
      :is-show-save="false"
      :is-show-btn-continue="false"
      :self-func="true"
      :title="'修改密码'"
      @merge="pwdMerge"
      @reset="resetForm"
  >
    <star-horse-form v-model:data-form="dataForm" :compUrl="dataUrl"
                     :fieldList="pwdFieldInfo"
                     :rules="rules" ref="pwdFormRef"/>
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="usersinfoTableListRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <el-row style="height: 100%;">
      <el-col :span="3" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <el-input
              v-model="query"
              size="small"
              clearable
              placeholder="请输入关键字"
              @input="onQueryChanged"
          >
            <template #suffix>
              <star-horse-icon icon-class="search" color="var(--star-horse-style)"/>
            </template>
          </el-input>
          <el-tree-v2 :data="deptList" :filter-method="filterMethod"
                      check-on-click-node="true"
                      @check-change="checkChange"
                      @node-click="checkChange"
                      :height="600"
                      show-checkbox
                      ref="treeRef" :props="{
            'label':'name',
            'value':'value'
          }"/>
        </el-card>
      </el-col>
      <el-col :span="21" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data:any)=>usersinfoTableListRef.createCreateParams(data)"
                                    :formData="searchFormData"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list v-if="!viewRolesinfoId"
                                    @tableCompFunc="(fun:any)=>usersinfoTableListRef.tableCompFunc(fun)"
                                    :compUrl="dataUrl"
                                    :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
          </div>
          <hr>
          <star-horse-table-comp :permissions="permissions" ref="usersinfoTableListRef" :fieldList="tableFieldList"
                                 :primaryKey="primaryKey"
                                 :compUrl="dataUrl"
                                 :dataFormat="dataFormat" :disableAction="disableAction"/>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>
<style lang="scss" scoped>
.el-card {
  height: 100%;
  :deep(.el-card__body) {
    height: 100%;
    padding: 0;
  }
}
</style>
