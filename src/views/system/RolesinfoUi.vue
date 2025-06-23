<script setup lang="ts" name="Rolesinfo">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
  SelectOption,
  UserFuncInfo
} from "star-horse-lowcode";
import {loadDepartmentInfo, loadSystemInfo} from "@/api/star_horse_utils";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref} from "vue";
import {isSystemManage} from "@/utils/auth";

const dataUrl: ApiUrls = apiInstance("system-config", "system/rolesinfoEntity");
let departmentList = ref<SelectOption[]>([]);
let systemList = ref<SelectOption[]>([]);
let menusList = ref([]);
let selfBtnFunc = ref<UserFuncInfo[]>([]);
const starHorseTableCompRef = ref();
// 0 普通角色 1高级角色 2普通管理员 3 超级管理员 默认 0
const roleTypes = ref<SelectOption[]>([
  {name: "普通用户组", value: 0},
  {name: "高级用户组", value: 1},
  {name: "超级用户组", value: 2}
]);
const sessionTimeOut = [
  {name: "15分钟", value: 15},
  {name: "30分钟", value: 30},
  {name: "60分钟", value: 60},
  {name: "180分钟", value: 180},
  {name: "无限制", value: 0}
];
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "用户组名称", fieldName: "roleName", defaultVisible: true, type: "input", matchType: "lk"},
    /* {label: "角色编码", fieldName: "roleCode", type: "input", matchType: "lk"},*/
    {
      label: "用户组类型", fieldName: "roleType", defaultVisible: true, type: "select",
      preps: {
        values: roleTypes
      }
    }
  ]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idRolesinfo",
      type: "long"
    },
    {
      label: "用户组名称",
      fieldName: "roleName",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    /*    {
        label: "归属部门", fieldName: "idDepartment", type: "select", optionList: departmentList,
        required: true,
      },
      {
        label: "归属部门", fieldName: "departments", type: "select", optionList: departmentList,
        required: true,  multiple:"Y",
      },*/
    {
      label: "用户组编码",
      fieldName: "roleCode",
      type: "input",
      listVisible: true,
      editdisabled: true,
      required: true
    },
    {
      label: "用户组类型",
      fieldName: "roleType",
      type: "select",
      optionList: roleTypes,
      required: true,
      formVisible: true,
      editdisabled: true,
      listVisible: true
    },
    {
      label: "会话超时时间",
      fieldName: "sessionTimeOut",
      type: "select",
      optionList: sessionTimeOut,
      required: true,
      formVisible: true,
      defaultValue: 30,
      listVisible: true
    },
    [
      {
        label: "系统权限",
        fieldName: "appsList",
        type: "select",
        optionList: systemList,
        required: true,
        multiple: true,
      },
      {
        label: "菜单权限",
        fieldName: "menusList",
        type: "tselect",
        required: true,
        multiple: true,
        preps: {
          data: menusList
        }
      }
    ],
    {
      label: "用户组职责",
      fieldName: "roleDesc",
      type: "textarea",
      formVisible: true,
      listVisible: true
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",
      type: "input",
      listVisible: true
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",
      type: "input"
    },
    {
      label: "创建日期",
      disabled: true,
      fieldName: "createdTime",
      type: "date",
      listVisible: true
    },
    {
      label: "修改日期",
      disabled: true,
      fieldName: "updatedTime",
      type: "date"
    },
    {
      label: "数据版本号",
      fieldName: "version",
      type: "number"
    },
    {
      label: "是否已逻辑",
      fieldName: "isDel",
      type: "number"
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input"
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input"
    },
    {
      label: "状态码名称",
      fieldName: "statusName",
      type: "input"
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input"
    }
  ]
});
const primaryKey = "idRolesinfo";
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: any, row: any): any => {
  let data = [] as Array<any>;
  if (name == "roleType") {
    let fdata = roleTypes.value.find((item) => item.value == parseInt(cellValue));
    return fdata?.name || cellValue;
  } else if (name == "departments" && row) {
    row["departments"]?.forEach((item: any) => {
      data.push(item.deptName);
      row["idDepartment"] = item.idDepartment;
    });
    return data.join(";");
  } else if (name == "appsList" && row) {
    row["appsList"]?.forEach((item: any) => {
      data.push(item.sysName);
    });
    return data.join(";");
  } else if (name == "menusList" && row) {
    row["menusList"]?.forEach((item: any) => {
      data.push(item.menuName);
    });
    return data.join(";");
  }
  return cellValue;
};
/**
 * 递归函数，查找已设置为快捷菜单的数据
 *
 * @param path
 * @param datas
 */
const recallFun = (id: string, datas: any): any => {
  let reitem: any = {};
  for (let key in datas) {
    let item = datas[key];
    if (item.idMenusinfo == id) {
      reitem = item;
      break;
    }
    if (Object.keys(item.children).length > 0) {
      reitem = recallFun(id, item.children);
      if (Object.keys(reitem).length > 0) {
        break;
      }
    }
  }
  return reitem;
};

const initData = async () => {
  let params: any = [
    {propertyName: "isDel", value: 0},
    {propertyName: "statusCode", value: "1"}
  ];
  departmentList.value = await loadDepartmentInfo(params);
  systemList.value = await loadSystemInfo(params);
  //只有系统管理员可以看到系统管理员
  if (isSystemManage()) {
    roleTypes.value.push({name: "系统用户组", value: 3});
  }
};
onMounted(async () => {
  await initData();
});
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        :compUrl="dataUrl"
        @refresh="starHorseTableCompRef?.loadByPage()"
        :fieldList="tableFieldList"
        :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => starHorseTableCompRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
        ref="starHorseTableCompRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
    />
  </el-card>
</template>
