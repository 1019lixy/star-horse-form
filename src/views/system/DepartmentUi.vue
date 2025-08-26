<script setup lang="ts">
import {
  apiInstance,
  ApiUrls,
  createCondition,
  dialogPreps,
  loadData,
  PageFieldInfo,
  SearchFields,
  SearchParams,
  SelectOption,
  UserFuncInfo,
  warning,
} from "star-horse-lowcode";
import { loadDepartmentInfo } from "@/api/star_horse_utils";
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
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance(
  "system-config",
  "system/department",
);
let departmentList = ref<SelectOption[]>([]);
let companyList = ref<Array<any>>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.department.name"),
      defaultVisible: true,
      fieldName: "deptName",
      matchType: "lk",
    },
    { label: i18n("system.department.code"), fieldName: "deptCode", matchType: "lk" },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idDepartment",
      type: "long",
    },
    {
      label: i18n("system.parent.department"),
      fieldName: "parentDept",
      type: "tselect",
      formVisible: true,
      preps: {
        checkStrictly: true,
        filterable: "Y",
        data: departmentList,
        props: {
          label: "deptName",
          value: "idDepartment",
        },
      },
    },
    [
      {
        label: i18n("system.department.name"),
        fieldName: "deptName",

        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("system.department.code"),
        fieldName: "deptCode",

        required: true,

        formVisible: true,
        listVisible: true,
        preps: {
          editdisabled: true,
        },
      },
    ],
    [
      {
        label: i18n("system.department.leader"),
        fieldName: "deptMasterName",
        aliasName: "deptMaster",
        type: "user",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          needField: [
            { sourceField: "name", distField: "deptMasterName" },
            { sourceField: "idEmployeeInfo", distField: "deptMaster" },
          ],
        },
      },
      {
        label: i18n("system.division.leader"),
        fieldName: "manageMasterName",
        aliasName: "manageMaster",
        type: "user",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          needField: [
            { sourceField: "name", distField: "manageMasterName" },
            { sourceField: "idEmployeeInfo", distField: "manageMaster" },
          ],
        },
      },
    ],
    {
      label: i18n("system.affiliated.company"),
      disabled: true,
      fieldName: "companyName",

      listVisible: true,
    },
    [
      {
        label: i18n("system.affiliated.company"),
        fieldName: "idCompanyDefine",
        type: "tselect",
        required: true,
        formVisible: true,
        preps: {
          checkStrictly: true,
          data: companyList,
          props: {
            label: "name",
            value: "idCompanyDefine",
          },
        },
      },
      {
        label: i18n("system.department.phone"),
        fieldName: "deptPhone",

        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: i18n("system.department.responsibility"),
      fieldName: "deptDesc",
      type: "textarea",
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.created.by"),
      disabled: true,
      fieldName: "createdBy",
    },
    {
      label: i18n("system.updated.by"),
      disabled: true,
      fieldName: "updatedBy",
    },
    {
      label: i18n("system.created.date"),
      disabled: true,
      fieldName: "createdTime",
      type: "date",
      listVisible: true,
    },
    {
      label: i18n("system.updated.date"),
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: i18n("system.data.version"),
      fieldName: "version",
      type: "number",
    },
    {
      label: i18n("system.is.deleted"),
      fieldName: "isDel",
      type: "number",
    },
    {
      label: i18n("system.data.number"),
      fieldName: "dataNo",
    },
    {
      label: i18n("system.status.code"),
      fieldName: "statusCode",
    },
    {
      label: i18n("system.status.name"),
      fieldName: "statusName",
    },
    {
      label: i18n("system.local"),
      fieldName: "local",
    },
  ],
  stopAutoLoad: true,
});
const primaryKey = "idDepartment";
const departmentRef = ref();
let outerForm = ref<any>({});
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: "添加子部门",
    authority: "add",
    icon: "add-dept",
    priority: 1,
    funcName: async (row: any) => {
      outerForm.value["parentDept"] = row[primaryKey];
      dialogProps.editVisible = true;
      await nextTick();
      // assignRoleCompanyRef.value.setSelectData(row.companyList);
    },
  },
]);

const dataFormat = (_name: string, cellValue: object): any => {
  return cellValue;
};
const activated = () => {
  initData();
};
const deactivated = () => {};
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
  departmentList.value = await loadDepartmentInfo([
    { propertyName: "isDel", value: 0 },
  ]);
};
let currentUserGroupId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);
const companyChange = (data: TreeNodeData, _checked: boolean) => {
  currentUserGroupId.value = data["idCompanyDefine"];
  defaultCondition.value = [
    createCondition("b.idCompanyDefine", currentUserGroupId.value),
  ];
  departmentRef.value.createSearchParams(defaultCondition.value);
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
<style lang="scss" scoped></style>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="departmentRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :outerFormData="outerForm"
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
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible size="240" min="100" max="500">
          <star-horse-tree
            v-model:tree-datas="companyList"
            :expand="true"
            treeTitle="公司列表"
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
                    (data: any) => departmentRef?.createSearchParams(data)
                  "
                  :formData="searchFormData"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              ref="departmentRef"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :extendBtns="extendBtns"
              :dataFormat="dataFormat"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
