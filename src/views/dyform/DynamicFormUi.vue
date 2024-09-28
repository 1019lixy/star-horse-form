<script setup lang="ts" name="DynamicForm">
import {apiInstance, dbConfigList, dialogPreps} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {computed, nextTick, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {BtnAuth} from "@/components/types/BtnAuth";
import {useRouter} from "vue-router";
import {loadData} from "@/api/sh_api";
import {Config} from "@/api/settings.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

const router = useRouter();
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicForm");
let designForm = DesignForm(piniaInstance);
let selfBtnFunc = ref<BtnAuth[]>([]);
let isPreview = ref<boolean>(false);
let dataSource = ref<SelectOption[]>([]);
const closeAction = () => {
  isPreview.value = false;
  designForm.setIsEdit(true);
};
let formData = ref<any>({});
let list = computed(() => designForm.compList);
const loadFormData = async (formId: any) => {
  let {data, error} = await loadData(dataUrl.loadByIdUrl + "/" + formId, {});
  if (error) {
    console.log(error);
  }
  await nextTick();
  isPreview.value = true;
  designForm.clearAll(false);
  designForm.setCompList(JSON.parse(data["details"].content));
  designForm.setFormData(JSON.parse(data["details"].fieldNames));
  designForm.setIsEdit(false);
  data["details"] = {};
  designForm.setFormInfo(data);
}
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "表单名称", fieldName: "formName", defaultShow: true, type: "input", matchType: "lk"},
    {label: "数据源", fieldName: "datasourceConfigId", defaultShow: true, type: "select", optionList: dataSource},

    {
      label: "创建时间", fieldName: "createdDate", defaultShow: true, type: "date", matchType: "bt", preps: {
        valueFormat: "YYYY-MM-DD"
      }
    },
  ]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  cellEditable: false,
  fieldList: [
    {
      label: "主键", fieldName: "idDynamicForm", type: "long",
    },
    {
      label: "表单名称", fieldName: "formName", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "表名", fieldName: "tbName", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "主键", fieldName: "formId", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "数据源", fieldName: "datasourceConfigId", type: "select",
      formShow: true,
      tableShow: true
    },
    {
      label: "是否需要公共字段", fieldName: "needCommonFields", type: "switch",
      formShow: true,
      tableShow: true
    },
    {
      label: "主键策略", fieldName: "primaryKeyPolicy", type: "select",
      formShow: true,
      tableShow: true
    },
    {
      label: "是否创建表", fieldName: "createTable", type: "switch",
      formShow: true,
      tableShow: true
    },
    {
      label: "是否创建菜单", fieldName: "createMenu", type: "switch",
      formShow: true,
      tableShow: true
    },
    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
      tableShow: true
    },

    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
      tableShow: true
    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
      tableShow: true
    },
    {
      label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",
      tableShow: true
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
      tableShow: true
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
  userTableFuncs: [{
    authority: "add", funcName: "addSubForm", btnName: "添加子表", funcName: (row) => {
      addSubForm(row);
    }
  }],
});
const primaryKey = "idDynamicForm";
const dynamicFormRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const addSubForm = (params: any) => {
  router.push({path: "/dyform/DynamicForm", query: {parentId: params.idDynamicForm}});
}
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "datasourceConfigId") {
    return dataSource.value.find(item => item.value!.toString() == cellValue)?.name || cellValue;
  }
  return cellValue == "Y" ? "是" : cellValue == "N" ? "否" : cellValue;
}
const initData = async () => {
  selfBtnFunc.value?.push({
    labelName: "新增",
    btnName: "add", exec: () => {
      router.push("/dyform/DynamicForm");
    }
  });
  selfBtnFunc.value?.push({
    labelName: "编辑",
    btnName: "edit", exec: (params: any) => {
      //params 页面刷新后 参数丢失，query 页面刷新后参数不会丢失
      router.push({
        path: "/dyform/DynamicForm",
        query: {formId: params[primaryKey], parentId: params["parentId"] || 0}
      });
    }
  });
  selfBtnFunc.value?.push({
    labelName: "查看详情",
    btnName: "view", exec: (params: any) => {
      loadFormData(params[primaryKey]);
    }
  });
  dataSource.value = await dbConfigList();
};
onMounted(async () => {
  await initData();
})
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog
      :dialogVisible="isPreview"
      @closeAction="closeAction"
      :selfFunc="true"
      :title="'表单预览'"
      :is-view="true"
  >
    <template v-for="data in list">
      <component
          :field="data"
          :formData="formData"
          :is="data?.itemType+'-container'"
          v-if="data?.compType==='container'"
      >
      </component>
      <component
          :field="data"
          :formData="formData"
          :is="data?.itemType + '-item'"
          v-else-if="data?.compType=='formItem'"
      />
    </template>
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>dynamicFormRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun:any)=>dynamicFormRef.tableCompFunc(fun)" :selfBtnFunc="selfBtnFunc"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="dynamicFormRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl=
        "dataUrl" :dataFormat="dataFormat" :selfBtnFunc="selfBtnFunc" :orderBy="[{
          fieldName:'a.createdDate',ascOrDesc:'desc'
        }]"/>
  </el-card>
</template>
