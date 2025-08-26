<script setup lang="ts" name="Usersinfo">
import {
  apiInstance,
  ApiUrls,
  createCondition,
  dialogPreps,
  loadById,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SearchFields,
  SearchParams,
  success,
  trim,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import { Config } from "@/api/settings";
import { computed, nextTick, onMounted, provide, reactive, ref } from "vue";
import { ElTreeV2 } from "element-plus";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import {
  baseUserFields,
  initSelectData,
  rolesList,
  sexList,
  userFormat,
} from "@/views/system/utils/UserFields";
import { i18n } from "@/lang";

const props = defineProps({
  viewRolesinfoId: { type: String },
  disableAction: { type: Boolean, default: false },
});
const dataUrl: ApiUrls = apiInstance("system-config", "system/usersinfo");
const usersinfoTableListRef = ref();
const searchFormData = reactive<SearchFields>({
  fieldList: [
    { label: i18n("system.name"), fieldName: "name", defaultVisible: true, matchType: "lk" },
    {
      label: i18n("system.username"),
      fieldName: "username",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.user.group"),
      fieldName: "idRolesinfo",
      type: "select",
      prefix: "b",
      defaultValue: props.viewRolesinfoId,
      disabled: !!props.viewRolesinfoId,
      preps: {
        values: rolesList,
      },
    },
  ],
});
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
//修改密码方法
const pwdFormRef = ref();
const resetForm = () => {
  let data = pwdFormRef.value.getFormData();
  data.value.password = "";
  data.value.rePassword = "";
  // ruleForm.value = {};
};
const pwdMerge = () => {
  pwdFormRef.value.$refs.starHorseFormRef.validate((valid: any) => {
    if (!valid) {
      return;
    }
    let pwdForm = pwdFormRef.value.getFormData().value;
    let pwd = pwdForm.password;
    let rePwd = pwdForm.rePassword;
    if (!trim(pwd)) {
      warning(i18n("system.cannot.set.empty.password"));
      return;
    }
    if (pwd.length < 6 || pwd.length > 15) {
      warning(i18n("system.password.length"));
      return;
    }
    if (pwd !== rePwd) {
      warning(i18n("system.password.mismatch"));
      return;
    }
    postRequest(
      "/system-config/system/usersAudit/refreshInvalidPassword/" +
        pwdForm.username +
        "/" +
        pwd +
        "/" +
        (pwdForm.oldPassword || "0") +
        "/" +
        pwdForm.phone,
      {}
    ).then((res) => {
      let redata = res.data;
      if (redata.code == 1) {
        warning(redata.cnMessage);
        return;
      }
      success(redata.cnMessage);
      dialogProps.bakeVisible3 = false;
    });
  });
};
const editPwd = async (row: any) => {
  let data = await loadById(dataUrl.loadByIdUrl!, row[primaryKey], {});
  console.log(dialogProps.bakeVisible3);
  dialogProps.bakeVisible3 = true;
  await nextTick();
  pwdFormRef.value.setFormData(data);
};
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: baseUserFields,
  stopAutoLoad: !!props.viewRolesinfoId,
  userTableFuncs: [
    {
      authority: "edit",
      btnName: i18n("system.change.password"),
      funcName: (row: any) => {
        editPwd(row);
      },
    },
  ],
});
const primaryKey = "idUsersinfo";
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const pwdFieldInfo = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: i18n("system.employee.no"),
        fieldName: "employeeNo",
        type: "tag",
        formVisible: true,
      },
      {
        label: i18n("system.username"),
        fieldName: "username",
        type: "tag",
        formVisible: true,
      },
    ],
    [
      {
        label: i18n("system.password"),
        fieldName: "password",
        type: "password",
        formVisible: true,
      },
      {
        label: i18n("system.confirm.password"),
        fieldName: "rePassword",
        type: "password",
        formVisible: true,
      },
    ],
  ],
});
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "sex") {
    let fdata = sexList.value.find(
      (item: any) => parseInt(item.value) == parseInt(cellValue),
    );
    return fdata?.name || cellValue;
  }

  return userFormat(name, cellValue, row);
};
const treeRef = ref<InstanceType<typeof ElTreeV2>>();
const query = ref("");
const onQueryChanged = (query: string) => {
  treeRef.value!.filter(query);
};
const filterMethod = (query: string, node: any) => {
  return node.name.toLowerCase()!.includes(query?.toLowerCase());
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
  console.log(data);

  conditions.push(createCondition("c.idDepartment", data.idDepartment));
  // menuTableListRef.value.setDataInfo(conditions, null);
  usersinfoTableListRef.value.createSearchParams(conditions);
};

const initData = async () => {
  await initSelectData();
  await nextTick();
  //如果是从其它页面加载的该页面，则将条件加入查询
  if (props.viewRolesinfoId) {
    let params: SearchParams[] = [
      { propertyName: "b.idRolesinfo", value: props.viewRolesinfoId },
    ];
    usersinfoTableListRef.value.createSearchParams(params);
  }
};
onMounted(async () => {
  await initData();
});

</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :dialog-visible="dialogProps.bakeVisible3"
      :is-show-reset="false"
      :is-show-save="false"
      :is-show-btn-continue="false"
      :self-func="true"
      :title="'修改密码'"
      :dialogProps="dialogProps"
      @merge="pwdMerge"
      @resetForm="resetForm"
    >
      <star-horse-form
        :compUrl="dataUrl"
        :fieldList="pwdFieldInfo"
        ref="pwdFormRef"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="usersinfoTableListRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="
            (data: any) => usersinfoTableListRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="usersinfoTableListRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        :disableAction="disableAction"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
