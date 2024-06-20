<script setup lang="ts" name="Rolesinfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {nextTick, onMounted, provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {loadDepartmentInfo, loadMenusInfo, loadSystemInfo} from "@/api/sh_api";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {BtnAuth} from "@/components/types/BtnAuth";
import {success, warning} from "@/utils/message";
import {loadRolesMenus} from "@/api/roles";
import {getRequest, postRequest} from "@/api/star_horse";
import UsersinfoUi from "@/views/system/UsersinfoUi.vue";
import UserTransfer from "@/views/system/comp/UserTransfer.vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {ElTreeV2} from "element-plus";
import {TreeNode} from "element-plus/es/components/tree-v2/src/types";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/rolesinfoEntity/pageList",
  mergeUrl: "/system-config/system/rolesinfoEntity/merge",
  mergeDraftUrl: "/system-config/system/rolesinfoEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/rolesinfoEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/rolesinfoEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/rolesinfoEntity/getById",
  deleteUrl: "/system-config/system/rolesinfoEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/rolesinfoEntity/exportData",
  downloadTemplateUrl: "/system-config/system/rolesinfoEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/rolesinfoEntity/getAllByCondition",
  importUrl: "/system-config/system/rolesinfoEntity/importData",
  uploadUrl: "",
  condition: []
};
let departmentList = ref<SelectOption[]>([]);
let systemList = ref<SelectOption[]>([]);
let menusList = ref([]);
let authorityMenusList = ref([]);
let selfBtnFunc = ref<BtnAuth[]>([]);
const starHorseTableCompRef = ref(null);
let currentRoleId = ref<Number>(0);

onMounted(() => {
  initData();
});
// 0 普通角色 1高级角色 2普通管理员 3 超级管理员 默认 0
const roleTypes = [{name: "普通角色", value: 0},
  {name: "高级角色", value: 1},
  {name: "普通管理员", value: 2},
  {name: "超级管理员", value: 3},
];
const sessionTimeOut = [
  {name: "15分钟", value: 15},
  {name: "30分钟", value: 30},
  {name: "60分钟", value: 60},
  {name: "180分钟", value: 180},
  {name: "无限制", value: 0},
];
const searchFormData = reactive<SearchProps[]>([
  {label: "角色名称", fieldName: "roleName", defaultShow: true, type: "input", matchType: "lk"},
  /* {label: "角色编码", fieldName: "roleCode", type: "input", matchType: "lk"},*/
  {label: "角色类型", fieldName: "roleType", defaultShow: true, type: "select", optionList: roleTypes},
]);

const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键", fieldName: "idRolesinfo", type: "long",


    },
    {
      label: "角色名称", fieldName: "roleName", type: "input",
      required: true, formShow: !false,
      tableShow: !false
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
      label: "角色编码", fieldName: "roleCode", type: "input",
      required: true,

    },
    {
      label: "角色类型", fieldName: "roleType", type: "select", optionList: roleTypes,
      required: true, formShow: !false,
      tableShow: !false
    },
    {
      label: "会话超时时间", fieldName: "sessionTimeOut", type: "select", optionList: sessionTimeOut,
      required: true, formShow: !false, defaultValue: 30,
      tableShow: !false
    },
    [{
      label: "系统权限", fieldName: "appsList", type: "select", optionList: systemList,
      required: true, multiple:"Y",

    },
      {
        label: "菜单权限", fieldName: "menusList", type: "tselect", optionList: menusList,
        required: true, multiple:"Y",

      }],
    {
      label: "角色描述", fieldName: "roleDesc", type: "textarea",
       formShow: !false,
      tableShow: !false
    },
    {
      label: "创建人", disabled:"Y", fieldName: "createdBy", type: "input",

      tableShow: true
    },
    {
      label: "修改人", disabled:"Y", fieldName: "updatedBy", type: "input",


    },
    {
      label: "创建日期", disabled:"Y", fieldName: "createdDate", type: "date",

      tableShow: true
    },
    {
      label: "修改日期", disabled:"Y", fieldName: "updatedDate", type: "date",


    },
    {
      label: "数据版本号", fieldName: "version", type: "number",


    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",


    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",


    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",


    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",


    },
    {
      label: "国际码", fieldName: "local", type: "input",


    },

  ],
  batchFieldList: [],
  userTableFuncs: [],
});
const primaryKey = "idRolesinfo";
const rules = {};
const searchForm = ref({});
provide("searchForm", searchForm);
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
const dataFormat = (name: string, cellValue: any, row: any): any => {
  let data = [] as Array<any>;

  if (name == "roleType") {

    let fdata = roleTypes.find(item => item.value == parseInt(cellValue));
    return fdata?.name || cellValue;
  } else if (name == "departments" && row) {
    row["departments"]?.forEach((item: any) => {
      data.push(item.deptName);
      row["idDepartment"] = item.idDepartment;
    });
    return data.join(";")
  } else if (name == "appsList" && row) {
    row["appsList"]?.forEach((item: any) => {
      data.push(item.sysName);
    });
    return data.join(";")
  } else if (name == "menusList" && row) {
    row["menusList"]?.forEach((item: any) => {
      data.push(item.menuName);
    });
    return data.join(";")
  }
  return cellValue;
};

/**
 * 检查是否选择了数据
 * @param msg
 */
const dataCheck = (msg: string) => {
  let ids = starHorseTableCompRef.value?.getIds();
  if (!ids || ids.length == 0) {
    warning(msg);
    return false;
  }
  if (ids.length > 1) {
    warning("请确认只选择了一个角色");
    return false;
  }
  currentRoleId.value = ids[0];
  return true;
};
/**
 * 分配菜单权限
 */

/**
 * 递归函数，查找已设置为快捷菜单的数据
 *
 * @param path
 * @param datas
 */
const recallFun = (id: number, datas: any): any => {
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
const menuAuthority = async () => {
  let id = dataCheck("请先选择要分配菜单权限的角色");
  if (!id) {
    return;
  }
  let params: any = [{propertyName: "isDel", value: 0}, {propertyName: "statusCode", value: '1'}];
  let roleMenus = await loadRolesMenus(currentRoleId.value);
  authorityMenusList.value = await loadMenusInfo(true, params, true);
  //打开弹窗
  dialogProps.bakeVisible1 = true;
  //渲染选中
  await nextTick(() => {
    //menuAuthorityRef.value!.clearSelection();
    setTimeout(() => {
      menuAuthorityRef.value!.setCheckedKeys(roleMenus);
    }, 500);

    /*   roleMenus.forEach((item: any) => {
         console.log(item)
         menuAuthorityRef.value!.setChecked(parseInt(item));
       });*/
  });
};
/**
 * 分配按钮权限
 */
const btnAuthority = () => {
  if (!dataCheck("请先选择要分配权按钮限的角色")) {
    return;
  }

};
/**
 * 查看角色下的用户
 */
const viewUsers = () => {
  if (!dataCheck("请先选择角色")) {
    return;
  }
  dialogProps.bakeVisible2 = true;
};
/**
 * 为角色分配用户
 */
const addUsers = async () => {
  if (!dataCheck("请先选择角色")) {
    return;
  }
  let userIds = [];
  await
      getRequest(`/system-config/system/rolesMenusinfo/roleUserIds/${currentRoleId.value}`).then(res => {
        let redata = res.data;
        if (redata.code == 0) {
          userIds = redata.data;
        }
      });
  dialogProps.bakeVisible3 = true;
  await nextTick();
  userResetForm(userIds);
};
const initData = async () => {
  let params: any = [{propertyName: "isDel", value: 0}, {propertyName: "statusCode", value: '1'}];
  departmentList.value = await loadDepartmentInfo(params);
  systemList.value = await loadSystemInfo(params);

  selfBtnFunc.value.push({
    btnName: "auth",
    labelName: "授权",
    icon: "card",
    children: [
      {
        labelName: "菜单权限",
        btnName: "menuAuth",
        exec: menuAuthority
      },
      {
        labelName: "按钮权限",
        btnName: "buttonAuth",
        exec: btnAuthority
      },
    ]
  });
  selfBtnFunc.value.push({
    btnName: "user",
    icon: "user-edit",
    labelName: "用户",
    children: [
      {
        labelName: "查看用户",
        btnName: "viewUser",
        exec: viewUsers
      },
      {
        labelName: "分配用户",
        btnName: "grantRowToUser",
        exec: addUsers
      }
    ]
  });
};
/**
 * 考虑角色管理 和角色权限分离
 * 增加角色成员，可一件移动角色
 * 部门增加部门成员
 * 增加应用主体（公司或者集团）
 * 可串联出谋公司下某部门，某公司的某系统等
 *
 */
const selectedMenuIds = ref([]);
const menuAuthorityRef = ref();
const selectMenus = (val: any) => {
  selectedMenuIds.value = val;
};

const submit = () => {
  let menuIds: Array<Number> = menuAuthorityRef.value!.getCheckedKeys();
  if (menuIds.length == 0) {
    warning("请先分配菜单权限");
    return;
  }

  postRequest(`/system-config/system/rolesMenusinfo/roleMenuAuthority/${currentRoleId.value}`, menuIds).then(res => {
    if (res.data.data) {
      success("操作成功");
      dialogProps.bakeVisible1 = false;
    } else {
      warning(res.data.cnMessage);
    }
  });
};
const resetForm = () => {
  let checkdData = menuAuthorityRef.value!.getCheckedKeys();
  checkdData.forEach((item: any) => {
    menuAuthorityRef.value!.setChecked(item, false);
  })
};
const selectedUsersRef = ref();
const userResetForm = (val: any) => {
  selectedUsersRef.value.resetSelect(val);
};
const userSubmit = () => {
  let userList: Array<Number> = selectedUsersRef.value.getSelectedUsers();
  if (userList.length == 0) {
    warning("请先为角色分配用户");
    return;
  }
  postRequest(`/system-config/system/rolesMenusinfo/roleUserAuthority/${currentRoleId.value}`, userList).then(res => {
    if (res.data.data) {
      success("操作成功");
      dialogProps.bakeVisible3 = false;
    } else {
      warning(res.data.cnMessage);
    }
  });
};
const query = ref('');
const onQueryChanged = (query: string) => {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
  menuAuthorityRef.value!.filter(query)
};
const filterMethod = (query: string, node: TreeNode) => {
  return node.menuName.toLowerCase()!.includes(query?.toLowerCase());
};
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog selfFunc="true" :dialogVisible="dialogProps.bakeVisible2" :title="'查看用户'" @resetForm=
      "resetForm" @merge="submit" :dialogProps="dialogProps" boxHeight="90%">
    <UsersinfoUi :disableAction="true" :viewRolesinfoId="currentRoleId"/>
  </star-horse-dialog>
  <star-horse-dialog selfFunc="true" :dialogVisible="dialogProps.bakeVisible3" title="分配用户" @resetForm=
      "userResetForm" @merge="userSubmit" :dialogProps="dialogProps" boxHeight="90%" boxWidth="1100px">
    <UserTransfer ref="selectedUsersRef"/>
  </star-horse-dialog>
  <star-horse-dialog self-func="true" :dialog-visible="dialogProps.bakeVisible1" :title="'菜单权限'" @resetForm=
      "resetForm" @merge="submit" :dialogProps="dialogProps" boxHeight="90%" boxWidth="40%">
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
      <el-tree-v2 :height="700"
                  :filter-method="filterMethod"
                  check-on-click-node="true"
                  ref="menuAuthorityRef"
                  :data="authorityMenusList"
                  :props="{
      'value':'idMenusinfo',
      'key':'idMenusinfo',
      'label':'menuName',
      'children':'children'
    }" show-checkbox/>
    </el-card>
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <!--  <el-card class = "inner_content">
      <el-row style = "height: 100%;">
        <el-col :span = "12" style = "height: 100%;">-->
  <el-card class="inner_content" style="height: 100%;">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>starHorseTableCompRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>starHorseTableCompRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :selfBtnFunc="selfBtnFunc"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="starHorseTableCompRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
  <!--     </el-col>
     <el-col :span = "12">
        <RolesMenusinfoUi style = "height: 100%"/>
      </el-col>
   </el-row>
  </el-card>-->
</template>
