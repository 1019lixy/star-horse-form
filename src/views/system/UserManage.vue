<script setup lang="ts" name="UserManage">
import {
  computed,
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  createTree,
  dialogPreps,
  loadData,
  PageFieldInfo,
  SearchFields,
  SearchParams,
  SelectOption,
  warning,
} from "star-horse-lowcode";
import { getCustomerParam } from "@/utils/auth";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import { i18n } from "@/lang";

//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/employeeInfo");
const props = defineProps({
  showButton: { type: Boolean, default: true },
  cellEditable: { type: Boolean, default: true },
  dialogInput: { type: Boolean, default: false },
  multipleSelect: { type: Boolean, default: false },
});
//主键
const primaryKey = "idEmployeeInfo";
const employeeInfoRef = ref();
const editable = computed(() => props.cellEditable);
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let companyDataList = ref<SelectOption[]>([]);
let departDataList = ref<SelectOption[]>([]);
let rankList = ref<any>([]);
let stationList = ref<any>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.name"),
      fieldName: "a.name",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.employee.number"),
      fieldName: "a.employeeNo",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.rank"),
      fieldName: "a.rank",
      defaultVisible: false,
      type: "tselect",
      preps: {
        data: rankList,
      },
    },
    {
      label: i18n("system.station"),
      fieldName: "a.station",
      defaultVisible: false,
      type: "tselect",
      preps: {
        data: stationList,
      },
    },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  cellEditable: editable,
  //属性列表
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idEmployeeInfo",

      required: true,
    },
    {
      dytableList: [
        [
          {
            label: i18n("system.name"),
            fieldName: "name",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: i18n("system.employee.number"),
            fieldName: "employeeNo",
            helpMsg: i18n("system.auto.generate.if.empty"),
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              editdisabled: true,
            },
          },
          {
            label: i18n("system.avatar"),
            fieldName: "photo",
            type: "upload",
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              autoUpload: "N",
              action: "xx",
              wordBreak: true,
              rowspan: 4,
            },
          },
        ],
        [
          {
            label: i18n("system.rank"),
            fieldName: "rank",
            type: "tselect",
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              data: rankList,
              showCode: "Y",
            },
          },
          {
            label: i18n("system.station"),
            fieldName: "station",
            type: "tselect",
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              data: stationList,
              showCode: "Y",
            },
          },
        ],
        [
          {
            label: i18n("system.affiliated.company"),
            fieldName: "idCompanyDefine",
            type: "tselect",
            required: true,
            formVisible: true,
            listVisible: true,
            actions: {
              change: (val: any) => {
                loadDepartByCompId(val);
              },
            },
            preps: {
              data: companyDataList,
              checkStrictly: true,
            },
          },
          {
            label: i18n("system.affiliated.department"),
            fieldName: "idDepartmentInfo",
            type: "tselect",
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              data: departDataList,
              checkStrictly: true,
            },
          },
        ],
        [
          {
            label: i18n("system.contact.phone"),
            fieldName: "phone",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: i18n("system.emergency.contact.phone"),
            fieldName: "bakePhone",

            helpMsg: i18n("system.emergency.contact.help"),
            required: true,
            formVisible: true,
            listVisible: true,
          },
        ],
        [
          {
            label: i18n("system.grant.system.login.authority"),
            fieldName: "loginAuthority",
            type: "switch",
            defaultValue: "N",
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              activeValue: "Y",
              inactiveValue: "N",
              colspan: 1,
            },
          },
        ],
      ],
    },
    {
      label: i18n("system.email"),
      fieldName: "email",

      required: false,
      formVisible: !true,
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
      listVisible: !true,
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.updated.by"),
      fieldName: "updatedBy",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",

      required: false,
      formVisible: !true,
      listVisible: !true,
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

      required: false,
      formVisible: !true,
      listVisible: !true,
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

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
  stopAutoLoad: false,
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let companyList = ref<Array<any>>([]);
const companyChange = (data: TreeNodeData, _checked: boolean) => {
  let compOrDeptId = data.value;
  let params: SearchParams[] = [];
  let cond = createCondition("a.idCompanyDefine", compOrDeptId);
  cond.orOperList = [createCondition("a.idDepartmentInfo", compOrDeptId)];
  params.push(cond);
  employeeInfoRef.value.createSearchParams(params);
};
const loadDepartByCompId = async (val: any) => {
  let params: SearchParams[] = [];
  let compId = val["idCompanyDefine"];
  departDataList.value = [];
  if (!compId) {
    return;
  }
  params.push(createCondition("a.idCompanyDefine", compId));
  let result = await loadData(
    "/system-config/system/department/getAllByCondition",
    {
      fieldList: params,
    },
  );
  if (result.error) {
    console.log(result.error);
  } else {
    departDataList.value = createTree(
      result.data,
      "idDepartment",
      "deptName",
      "",
    );
  }
};
//初始化方法
const initData = async () => {
  let result = await loadData(
    "/system-config/system/companyDefine/compDeptTree",
    {},
  );
  if (result.error) {
    warning(result.error);
  } else {
    companyList.value = result.data;
  }

  result = await loadData(
    "/system-config/system/companyDefine/getAllByCondition",
    {},
  );
  if (result.error) {
    warning(result.error);
  } else {
    companyDataList.value = createTree(
      result.data,
      "idCompanyDefine",
      "name",
      "",
    );
  }
  //加载职级
  result = await loadData("/system-config/system/rankDefine/rankTree", {});
  if (result.error) {
    warning(result.error);
  } else {
    rankList.value = result.data;
  }
  //加载岗位
  result = await loadData(
    "/system-config/system/stationDefine/stationTree",
    {},
  );
  if (result.error) {
    warning(result.error);
  } else {
    stationList.value = result.data;
  }
};
const activated = () => {
  //initData();
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
  if (name == "idCompanyDefine") {
    return row["companyName"] || cellValue;
  }
  if (name == "idDepartmentInfo") {
    return row["deptName"] || cellValue;
  }
  if (name == "rank") {
    return row["rankName"] || cellValue;
  }
  if (name == "station") {
    return row["stationName"] || cellValue;
  }
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

let test = ref("");
const testChange = (val: any) => {
  console.log(val);
};
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialog-visible="dialogProps?.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="employeeInfoRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps?.viewVisible"
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
            :treeTitle="i18n('system.organization')"
            @selectData="companyChange"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <el-card class="inner_content">
            <div class="search-content">
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) => employeeInfoRef?.createSearchParams(data)
                  "
                  :formData="searchFormData"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              ref="employeeInfoRef"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :dialogInput="dialogInput"
              :multipleSelect="multipleSelect"
              :disableAction="!showButton"
              :dataFormat="dataFormat"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
