<script setup lang="ts" name="CompanyRole">
import {
  apiInstance,
  closeLoad,
  createCondition,
  dialogPreps,
  dictData,
  load,
  loadData
} from "star-horse-lowcode";
import {Config} from "@/api/settings";
import {computed, nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {
  ApiUrls,
  SearchFields,
  SelectOption,
  PageFieldInfo,
  UserFuncInfo,
  useGlobalConfigStore,
  SearchParams,
  DyCompField,
  piniaInstance,
  postRequest
} from "star-horse-lowcode";
import {getCustomerParam} from "@/utils/auth";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {operationConfirm, error, success, warning} from "star-horse-lowcode";
import {statusList} from "@/views/system/utils/UserFields.ts";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/companyRole");
dataUrl.condition = [createCondition("a.roleType", "common_role")];
//主键
const primaryKey = "idCompanyRole";
const companyRoleRef = ref();
const assignRoleCompanyRef = ref();
let companyList = ref<Array<any>>([]);
let outerFormData = ref<any>({
  roleType: "common_role"
});
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
let currentUserGroupId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);
const companyChange = (data: TreeNodeData, _checked: boolean) => {
  currentUserGroupId.value = data["idCompanyDefine"];
  defaultCondition.value = [createCondition("b.idCompanyDefine", currentUserGroupId.value)];
  companyRoleRef.value.createSearchParams(defaultCondition.value);
};
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "角色名称",
      fieldName: "roleName",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "角色编码",
      fieldName: "roleCode",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    }
  ]
});
const viewCompField = ref<DyCompField>({
  name: "RoleCompanyList",
  emits: ["closeAction"],
  methods: {
    closeAction: (role: any, item: any) => {
      console.log(role, item);
      operationConfirm("确定要删除吗？").then((_) => {
        postRequest(
            `/system-config/system/companyRolePkDefine/deleteData/${role.idCompanyRole}/${item.idCompanyDefine}`,
            {}
        ).then((res) => {
          if (res.data.code) {
            warning(res.data.cnMessage);
            return;
          }
          companyRoleRef.value.loadByPage();
        });
      });
    }
  },
  template: `
    <el-card class="inner_content hover_content">
      <template #header>
        归属公司
      </template>
      <div class="content">
        <el-tag v-for="temp in data.companyList" type="success" closable @close="closeAction(data,temp)">
          {{ temp.name }}
        </el-tag>
      </div>
    </el-card>`
});
let roleTypeList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    /* {
     label: "角色类型",
     fieldName: "roleType",
     type: "select",
     optionList: roleTypeList,
     required: true,
     formVisible: !false,
     listVisible: !false,
   },*/
    {
      label: "角色名称",
      fieldName: "roleName",
      type: "input",
      required: true,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "角色编码",
      fieldName: "roleCode",
      type: "input",
      required: true,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "归属公司(数量)",
      fieldName: "assignCompanies",
      type: "tag",
      required: false,
      listVisible: true,
      preps: {
        showComp: "Y",
        compAction: "click",
        styles: {
          cursor: "pointer"
        },
        popover: "Y",
        compField: viewCompField,
        placeholder: "0",
        compFunc: (val: any) => {
          alert(val["assignCompanies"]);
        }
      }
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "创建人",
      fieldName: "createdBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: true
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: true
    },
    {
      label: "修改人",
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: true
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: true
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "select",
      optionList: statusList,
      required: false,
      formVisible: true,
      listVisible: !true
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "国际编码",
      fieldName: "local",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: !true
    }
  ],
  //默认查询条件
  condition: [getCustomerParam()]
});
//校验
const rules = {};
let outerForm = ref<any>({});
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let extandBtns = ref<UserFuncInfo[]>([
  {
    btnName: "配置归属公司",
    authority: "add",
    icon: "setting",
    priority: 1,
    funcName: async (row: any) => {
      outerForm.value["idCompanyRole"] = row[primaryKey];
      dialogProps.bakeVisible1 = true;
      await nextTick();
      console.log(row, row.companyList);
      assignRoleCompanyRef.value.setSelectData(JSON.parse(JSON.stringify(row.companyList)));
    }
  }
]);
//初始化方法
const initData = async () => {
  let result = await loadData("/system-config/system/companyDefine/getAllByCondition", {});
  if (result.error) {
    warning(result.error);
    return;
  }
  companyList.value = result.data;
  roleTypeList.value = await dictData("company_role_type");
};
const assignCompany = () => {
  let selectedDatas = assignRoleCompanyRef.value.getSelectData();
  console.log(selectedDatas);
  if (!selectedDatas || selectedDatas.length == 0) {
    warning("请设置当前角色的归属公司");
    return;
  }
  let datas = [];
  for (let index in selectedDatas) {
    datas.push({
      idCompanyRole: outerForm.value["idCompanyRole"],
      idCompanyDefine: selectedDatas[index].idCompanyDefine
    });
  }
  load("数据提交中");
  postRequest("/system-config/system/companyRolePkDefine/mergeBatch", datas)
      .then((res) => {
        if (res.data.code) {
          error(res.data.cnMessage);
          return;
        }
        success(res.data.cnMessage);
        dialogProps.bakeVisible1 = false;
        companyRoleRef.value.loadByPage();
      })
      .finally(() => closeLoad());
};
const activated = () => {
  initData();
};
const deactivated = () => {
};
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  //转换显示信息
  return cellValue;
};
onMounted(async () => {
  await initData();
});
onActivated(() => {
  activated();
});
onDeactivated(() => {
  deactivated();
});
</script>
<template>
  <star-horse-dialog
      :self-func="true"
      :title="'设置角色归属公司'"
      :dialog-visible="dialogProps.bakeVisible1"
      :dialogProps="dialogProps"
      @merge="assignCompany"
      @closeAction="dialogPreps.bakeVisible1 = false"
  >
    <star-horse-tree
        v-model:tree-datas="companyList"
        :showCheckBox="true"
        expand="true"
        treeTitle="公司列表"
        showSelectData="true"
        ref="assignRoleCompanyRef"
        :preps="{
        label: 'name',
        value: 'idCompanyDefine'
      }"
        :compSize="compSize"
    />
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="companyRoleRef.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
        :outerFormData="outerFormData"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :isView="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-row :gutter="10" class="h100-overflow-hidden">
    <el-col :span="5" class="h100">
      <star-horse-tree
          v-model:tree-datas="companyList"
          :expand="true"
          treeTitle="公司列表"
          @selectData="companyChange"
          :preps="{
          label: 'name',
          value: 'idCompanyDefine'
        }"
          :compSize="compSize"
      />
    </el-col>
    <el-col :span="19" class="h100">
      <div class="search-content">
        <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
          <star-horse-search-comp
              @searchData="(data: any) => companyRoleRef.createSearchParams(data)"
              :formData="searchFormData"
              :compUrl="dataUrl"
          />
        </div>
      </div>
      <el-card class="inner_content h100">
        <star-horse-table-comp
            ref="companyRoleRef"
            :fieldList="tableFieldList"
            :primaryKey="primaryKey"
            :compUrl="dataUrl"
            :extandBtns="extandBtns"
            :dataFormat="dataFormat"
        />
      </el-card>
    </el-col>
  </el-row>
</template>
<style lang="scss">
.hover_content {
  margin: 0;
  width: 400px;

  .content {
    margin: 10px 5px;
    display: flex;
    justify-content: start;

    .el-tag {
      margin-left: 10px;
    }
  }
}
</style>
