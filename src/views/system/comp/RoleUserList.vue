<script setup lang="ts" name="RoleUserList">
import {
  onActivated,
  onDeactivated,
  onMounted,
  PropType,
  provide,
  reactive,
  ref,
} from "vue";
import { getCustomerParam } from "@/utils/auth";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  dialogPreps,
  load,
  loadData,
  operationConfirm,
  PageFieldInfo,
  postRequest,
  SearchFields,
  SearchParams,
  success,
  UserFuncInfo,
  warning,
} from "star-horse-lowcode";
import { analysisField } from "@/api/star_horse_utils";
import { i18n } from "@/lang";

//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/employeeInfo");
dataUrl.pageListUrl = "/system-config/system/employeeInfo/compRolePageList";
dataUrl.deleteUrl =
  "/system-config/system/companyRolePkEmployee/batchDeleteById";
const props = defineProps({
  showButton: { type: Boolean, default: true },
  dialogInput: { type: Boolean, default: false },
  multipleSelect: { type: Boolean, default: false },
  queryCondition: { type: Array as PropType<SearchParams[]>, default: [] },
});
//主键
const primaryKey = "idEmployeeInfo";
const employeeInfoRef = ref();
//定义表单的所有属性
let rankList = ref<any>([]);
let stationList = ref<any>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.name"),
      fieldName: "name",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.employee.number"),
      fieldName: "employeeNo",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.rank"),
      fieldName: "rank",
      defaultVisible: false,
      type: "tselect",
      preps: {
        data: rankList,
      },
    },
    {
      label: i18n("system.station"),
      fieldName: "station",
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
  cellEditable: false,
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

            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              editDisabled: true,
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
              rowspan: 2,
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

            required: true,
            formVisible: true,
            listVisible: true,

            preps: {
              checkStrictly: true,
            },
          },
          {
            label: i18n("system.affiliated.department"),
            fieldName: "idDepartmentInfo",

            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              checkStrictly: true,
            },
          },
        ],
        [
          {
            label: i18n("system.contact.phone"),
            fieldName: "phone",

            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              colspan: 1,
            },
          },
        ],
      ],
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
      preps: {
        dataSource:"dict",
        urlOrDictName:"public"
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
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: i18n("system.remove"),
    authority: "delete",
    icon: "delete",
    funcName: async (row: any) => {
      let flag = await operationConfirm(i18n("system.confirm.remove"));
      if (flag) {
        let params: Array<any> = [];
        let idCompanyDefine = analysisField(
          props.queryCondition,
          "idCompanyDefine",
        );
        let idCompanyRole = analysisField(
          props.queryCondition,
          "idCompanyRole",
        );
        params.push({
          idEmployee: row.idEmployeeInfo,
          idCompanyDefine: idCompanyDefine.value,
          idCompanyRole: idCompanyRole.value,
        });
        load(i18n("system.data.processing"));
        employeeInfoRef.value.loadByPage();
        postRequest(dataUrl.deleteUrl!, params)
          .then((res) => {
            if (res.data.code) {
              warning(res.data.cnMessage);
              return;
            }
            success(i18n("system.operation.success"));
          })
          .finally(() => closeLoad());
      }
    },
  },
]);
//初始化方法
const initData = async () => {
  console.log(props.queryCondition);
  tableFieldList.condition = [...props.queryCondition];
  let cond = getCustomerParam();
  if (cond) {
    tableFieldList.condition.push(cond);
  }
  //加载职级
  let result = await loadData("/system-config/system/rankDefine/rankTree", {});
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
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
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
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="(data: any) => employeeInfoRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="employeeInfoRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dialogInput="dialogInput"
        :filterCondition="tableFieldList.condition"
        :multipleSelect="multipleSelect"
        :disableAction="!showButton"
        :extendBtns="extendBtns"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
