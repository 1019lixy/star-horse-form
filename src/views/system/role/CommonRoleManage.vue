<script setup lang="ts" name="CompanyRole">
import {
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import { statusList } from "@/views/system/utils/UserFields";
import { getCustomerParam } from "@/utils/auth";
import { i18n } from "@/lang";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  createCondition,
  dialogPreps,
  dictData,
  DyCompField,
  error,
  ExpandTable,
  load,
  loadData,
  PageFieldInfo,
  postRequest,
  SearchFields,
  SearchParams,
  SelectOption,
  success,
  UserFuncInfo,
  warning,
} from "star-horse-lowcode";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance(
  "system-config",
  "system/companyRolePkEmployee",
);
dataUrl.condition = [createCondition("a.roleType", "common_role")];
//主键
const primaryKey = "idCompanyDefine";
const companyRoleRef = ref();
const assignRoleCompanyRef = ref();
let companyList = ref<Array<any>>([]);
let outerFormData = ref<any>({
  roleType: "common_role",
});
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let currentUserGroupId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);
const companyChange = (data: TreeNodeData, _checked: boolean) => {
  currentUserGroupId.value = data["idCompanyDefine"];
  defaultCondition.value = [
    createCondition("b.idCompanyDefine", currentUserGroupId.value),
  ];
  companyRoleRef.value.createSearchParams(defaultCondition.value);
};
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.role.name"),
      fieldName: "roleName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.role.code"),
      fieldName: "roleCode",
      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
const viewCompField = ref<DyCompField>({
  name: "UserInfoComp",
  emits: ["closeAction"],
  methods: {
    i18n: (key: string) => {
      return i18n?.(key) ?? key;
    },
  },
  onMounted: () => {},
  template: `
    <el-descriptions
        :title="i18n('system.personnel.info')"
        direction="vertical"
        border
        style="margin-top: 10px"
    >
      <el-descriptions-item
          :rowspan="2"
          :width="140"
          :label="i18n('system.avatar')"
          align="center"
      >
        <el-image
            style="width: 100px; height: 100px"
            :src="data.name||''"
        />
      </el-descriptions-item>
      <el-descriptions-item :label="i18n('system.name.employee.number')">{{ data.name }}/{{ data.employeeNo }}</el-descriptions-item>
      <el-descriptions-item :width="140" :label="i18n('system.contact.phone')">{{ data.phone || "--" }}</el-descriptions-item>
      <el-descriptions-item :label="i18n('system.rank')">{{ data.rank || "--" }}</el-descriptions-item>
      <el-descriptions-item :label="i18n('system.position')">{{ data.station || "--" }}</el-descriptions-item>
      <el-descriptions-item :label="i18n('system.affiliated.organization')">
        {{ data.companyName }}-{{ data.deptName }}
      </el-descriptions-item>
    </el-descriptions>
  `,
});
let roleTypeList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: i18n("system.role.name"),
      fieldName: "roleName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.role.code"),
      fieldName: "roleCode",

      required: true,
      formVisible: true,
      listVisible: true,
    },

    {
      label: i18n("system.version"),
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.created.by"),
      fieldName: "createdBy",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.updated.by"),
      fieldName: "updatedBy",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.data.number"),
      fieldName: "dataNo",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.status.code"),
      fieldName: "statusCode",
      type: "select",
      required: false,
      formVisible: true,
      listVisible: !true,
      preps: {
        dataSource: "dict",
        urlOrDictName: "public",
      },
    },
    {
      label: i18n("system.status.name"),
      fieldName: "statusName",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.is.logical.deleted"),
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.international.code"),
      fieldName: "local",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.remark"),
      fieldName: "remark",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: !true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});

const expandTable = reactive<ExpandTable>({
  dataField: "employeeList",
  title: i18n("system.personnel.info"),
  primaryKey: [
    "idCompanyDefine",
    "idCompanyRole",
    {
      source: "idEmployeeInfo",
      dist: "idEmployee",
    },
  ],
  showButton: true,
  expandUrls: {
    deleteUrl: "/system-config/system/companyRolePkEmployee/batchDeleteById",
  },
  extendFuncs: [
    {
      icon: "delete",
      btnName: i18n("system.delete"),
      authority: "delete",
    },
  ],
  fieldList: [
    {
      label: i18n("system.name"),
      fieldName: "name",
      type: "tag",
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        showComp: true,
        popover: true,
        styles: {
          cursor: "pointer",
        },
        placement: "top",
        compInfo: viewCompField,
      },
    },
    {
      label: i18n("system.affiliated.company"),
      fieldName: "companyName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.affiliated.department"),
      fieldName: "deptName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const userTableRef = ref();
let currentRow = ref<any>({});
let extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: i18n("system.add.personnel"),
    authority: "add",
    icon: "user-add",
    funcName: async (row: any) => {
      if (!currentUserGroupId.value) {
        warning(i18n("system.please.select.company.first"));
        return;
      }
      currentRow.value = row;
      dialogProps.bakeVisible1 = true;
      await nextTick();
      assignRoleCompanyRef.value.setSelectData(row.companyList);
    },
  },
]);
//初始化方法
const initData = async () => {
  let result = await loadData(
    "/system-config/system/companyDefine/getAllByCondition",
    {},
  );
  if (result.error) {
    warning(result.error);
    return;
  }
  companyList.value = result.data;
  roleTypeList.value = await dictData("company_role_type");
};
const assignRoleUser = () => {
  let selectedDatas =
    userTableRef.value.$refs.employeeInfoRef.multipleSelection;
  console.log(selectedDatas);
  if (!selectedDatas || selectedDatas.length == 0) {
    warning(i18n("system.please.select.personnel.info"));
    return;
  }
  let datas = [];
  for (let index in selectedDatas) {
    datas.push({
      idCompanyDefine: currentRow.value.idCompanyDefine,
      idCompanyRole: currentRow.value.idCompanyRole,
      idEmployee: selectedDatas[index].idEmployeeInfo,
    });
  }
  load(i18n("system.data.submitting"));
  postRequest("/system-config/system/companyRolePkEmployee/mergeBatch", datas)
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
const deactivated = () => {};
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
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :self-func="true"
      :title="i18n('system.add.personnel')"
      :dialog-visible="dialogProps.bakeVisible1"
      :dialogProps="dialogProps"
      @merge="assignRoleUser"
    >
      <div style="width: 100%">
        <user-manage
          :cellEditable="false"
          :showButton="false"
          :dialogInput="true"
          :multipleSelect="true"
          ref="userTableRef"
        />
      </div>
    </star-horse-dialog>
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialog-visible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="companyRoleRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
        :outerFormData="outerFormData"
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
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible size="240" min="100" max="500">
          <star-horse-tree
            v-model:tree-datas="companyList"
            :expand="true"
            :treeTitle="i18n('system.company.list')"
            @selectData="companyChange"
            :preps="{
              label: 'name',
              value: 'idCompanyDefine',
            }"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <el-card class="inner_content">
            <div class="search-content">
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) => companyRoleRef?.createSearchParams(data)
                  "
                  :formData="searchFormData"
                  :defaultCondition="defaultCondition"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              ref="companyRoleRef"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :disableAction="true"
              :expandTable="expandTable"
              :extendBtns="extendBtns"
              :dataFormat="dataFormat"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
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
