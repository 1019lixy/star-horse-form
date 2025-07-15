<script lang="ts" setup>
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  postRequest,
  SearchFields,
  SelectOption
} from "star-horse-lowcode";
import { loadCustomInfo, loadElementPlusIcon, loadSystemInfo } from "@/api/star_horse_utils";
import { Config } from "@/api/settings";
import { onActivated, onMounted, provide, reactive, ref } from "vue";

let informationsList = ref<any>([]);
const dataUrl: ApiUrls = apiInstance("system-config", "system/informationsEntity");
dataUrl.loadByIdUrl = dataUrl.basePrefix + "/getInformationById";
let systemIconList = ref<SelectOption[]>([]);
let customerList = ref<SelectOption[]>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "归属主体", fieldName: "idCustomer", type: "select",
      preps: {
        values: customerList
      }
    },
    {
      label: "系统名称",
      defaultVisible: true,
      fieldName: "sysName",

      matchType: "lk"
    },
    { label: "添加时间", fieldName: "createdTime", type: "daterange", matchType: "bt" }
  ]
});
const testFun = (formData: any) => {
  if (!formData["parentId"]) {
    return;
  }
  postRequest(dataUrl.loadByIdUrl + "/" + formData["parentId"], {}).then((res) => {
    let redata = res.data.data;
    formData["idCustomer"] = redata["idCustomer"];
  });
};
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idInformations",
      type: "long"
    },
    {
      label: "上级系统",
      fieldName: "parentId",
      type: "select",
      formVisible: true,
      actions: { change: testFun },
      preps: {
        values: informationsList,
      }
    },
    [
      {
        label: "系统名称",
        fieldName: "sysName",

        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "归属主体",
        fieldName: "idCustomer",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          values: customerList,
        }
      }
    ],
    /* {
     label: "归属主体", fieldName: "customer['customerName']", type: "select",
     required: true,
     listVisible: true
   },*/
    {
      label: "系统编码",
      fieldName: "sysCode",

      required: true,
      disabled: true,
      listVisible: true
    },
    [
      {
        label: "系统Logo",
        fieldName: "sysLogo",
        type: "icon",
        formVisible: true,
        listVisible: true,
        preps: {
          iconType: "system",
          values: loadElementPlusIcon()
        }
      },
      {
        label: "数据排序",
        fieldName: "dataSort",
        type: "number",
        formVisible: true,
        listVisible: true
      }
    ],
    {
      label: "系统描述",
      fieldName: "sysDesc",
      type: "textarea",
      formVisible: true,
      listVisible: true,
      actions: { input: testFun }
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",

    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",

    },
    {
      label: "创建日期",
      disabled: true,
      fieldName: "createdTime",
      type: "date"
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

    },
    {
      label: "状态码",
      fieldName: "statusCode",

    },
    {
      label: "状态码名称",
      fieldName: "statusName",

    },
    {
      label: "国际码",
      fieldName: "local",

    }
  ]
});
const primaryKey = "idInformations";
const informationsRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: object): any => {
  if (name == "parentId") {
    return informationsList.value.find((item: SelectOption) => item.value == cellValue)?.name || cellValue;
  } else if (name == "idCustomer") {
    return customerList.value.find((item: SelectOption) => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};
const initData = async () => {
  let params = [{ propertyName: "statusCode", value: "1" }];
  const datas = await loadSystemInfo(params);
  const customs = await loadCustomInfo(params);
  informationsList.value = datas;
  customerList.value = customs;
  systemIconList.value = loadElementPlusIcon();
};
onMounted(async () => {
  await initData();
});
onActivated(() => {
})
</script>
<style></style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="informationsRef?.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
      :rules="rules" />
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :source="3">
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" >
      <star-horse-search-comp @searchData="(data: any) => informationsRef?.createSearchParams(data)"
        :formData="searchFormData" :compUrl="dataUrl" />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp ref="informationsRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
      :dataFormat="dataFormat" />
  </el-card>
</template>
