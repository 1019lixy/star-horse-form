<script setup lang="ts" name="Dbinfo">
import {computed, onMounted, provide, reactive, ref} from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  loadData,
  loadGetData,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  success,
  useGlobalConfigStore,
  warning
} from "star-horse-lowcode";
import {Config} from "@/api/settings";

const dataUrl: ApiUrls = apiInstance("userdb-manage", "dbsearch/dbinfoEntity");
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
let dbTypeList = ref<Array<any>>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "数据库类型", fieldName: "dbType", type: "select", defaultVisible: true, optionList: dbTypeList},
    {label: "数据库名称", fieldName: "dbName", type: "input", defaultVisible: true, matchType: "lk"}
  ]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idDbinfo",
      type: "long"
    },
    [
      {
        label: "数据库类型",
        fieldName: "dbType",
        type: "select",
        optionList: dbTypeList,
        required: true,
        formVisible: true,
        actionName: "change",
        actions: (val: any) => {
          val["port"] = dbTypeList.value.find((item) => item.value == val["dbType"])?.port || val["port"];
        },
        listVisible: true
      },
      {
        label: "数据库名称/实例",
        fieldName: "dbName",
        type: "input",
        formVisible: true,
        required: true,
        listVisible: true,
        brotherNodes: [
          {
            fieldName: "createDb",
            type: "radio",
            defaultValue: "N",
            formVisible: true,
            optionList: [{name: "不存在创建", value: "Y"}]
          }
        ]
      }
    ],
    [
      {
        label: "数据库地址",
        fieldName: "host",
        type: "input",
        formVisible: true,
        required: true,
        listVisible: true
      },
      {
        label: "数据库端口",
        fieldName: "port",
        type: "number",
        formVisible: true,
        required: true,
        listVisible: true
      }
    ],
    [
      {
        label: "用户名",
        fieldName: "userName",
        type: "input",
        formVisible: true,
        required: true,
        listVisible: true
      },
      {
        label: "密码",
        fieldName: "password",
        type: "password",
        formVisible: true,
        required: true,
        listVisible: true
      }
    ],
    {
      label: "禁用操作权限",
      fieldName: "exclusions",
      type: "textarea",
      formVisible: true,
      listVisible: true
    },
    {
      label: "数据库描述",
      fieldName: "dbComment",
      type: "textarea",
      formVisible: true,
      listVisible: true
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",
      type: "input"
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
  ],
  batchFieldList: []
});
const primaryKey = "idDbinfo";
const dbinfoRef = ref();
const dbinfoFormRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const loadDbTypeList = async () => {
  let {data, error} = await loadGetData("/userdb-manage/dbsearch/dbinfoEntity/dbType");
  if (error) {
    warning(error);
    return;
  }
  for (let val in data) {
    let sdata: any = {name: data[val].dbTypeName, value: data[val].dbTypeCode, port: data[val].dbDefaultPort};
    dbTypeList.value.push(sdata);
  }
};
const dataFormat = (name: string, cellValue: object): any => {
  if (name == "password") {
    return "******";
  } else if (name == "dbType") {
    let data = dbTypeList.value.find((item) => item.value == cellValue);
    return data ? data.name : cellValue;
  }
  return cellValue;
};
/**
 * 验证
 */
const validDb = async () => {
  let valid = await dbinfoFormRef.value.$refs.starHorseFormRef.validate();
  if (!valid) {
    return;
  }
  let data = dbinfoFormRef.value.getFormData().value;
  let resultData = await loadData("/userdb-manage/dbsearch/dbinfoEntity/validDbInfo", data);
  if (resultData.error) {
    warning(resultData.error);
    return;
  } else {
    success("验证通过");
  }
};
const initData = async () => {
  await loadDbTypeList();
};
onMounted(() => {
  initData();
});
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :compSize="compSize"
      :dialogProps="dialogProps"
  >
    <star-horse-form
        @refresh="dbinfoRef.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
        ref="dbinfoFormRef"
    />
    <template #extend>
      <el-button @click="validDb" type="primary" :size="compSize">
        <star-horse-icon icon-class="valid" color="var(--star-horse-white)"/>
        验证
      </el-button>
    </template>
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
          @searchData="(data: any) => dbinfoRef.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
        ref="dbinfoRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :order-by="[
        {
          fieldName: 'createdTime',
          ascOrDesc: 'desc'
        }
      ]"
        :dataFormat="dataFormat"
    />
  </el-card>
</template>
