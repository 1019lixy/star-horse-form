<script setup lang="ts" name="DictinfoType">
import {apiInstance, dialogPreps} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import DictinfoUI from "@/views/system/DictinfoUI.vue";
import {SearchParams} from "@/components/types/Params";

const dataUrl: ApiUrls = apiInstance("system-config", "system/dictinfoType");
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "名称", defaultVisible: false, matchType: "lk", fieldName: "dictTypeName", type: "input"},
    {label: "编码", defaultVisible: true, matchType: "eq", fieldName: "dictTypeCode", type: "input"},
  ]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idDictinfoType", type: "long",
    },
    {
      label: "字典类型名称", fieldName: "dictTypeName", type: "input",
      required: true, formVisible: true,
      listVisible: true
    },
    {
      label: "字典类型编码", fieldName: "dictTypeCode", type: "input",
      required: true, formVisible: true,
      listVisible: true
    },
    {
      label: "备注", fieldName: "remark", type: "textarea",
      formVisible: true,
      listVisible: true
    },
  ],
  //在表格右侧添加自定义功能
});
const primaryKey = "idDictinfoType";
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (_name: string, cellValue: object): any => {
  return cellValue;
}
let dictTypeCode = ref<string>("");
const dictTypeRef = ref();
//在ts中获取不到方法
const selectItemFun = (row: any) => {
  dictTypeCode.value = row["dictTypeCode"];
};
const searchData = (data: SearchParams[]) => {
  dictTypeRef.value.createSearchParams(data);
};
const initData = async () => {

};
onMounted(async () => {
  await initData();
})
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
      <star-horse-form @refresh="dictTypeRef.loadByPage()" :compUrl="dataUrl"
                       :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="dict-content">
      <div class="dict-type">
        <el-card class="inner_content">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data:any)=>dictTypeRef.createSearchParams(data)"
                                    :formData="searchFormData"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list @tableCompFunc="(fun:any)=>dictTypeRef.tableCompFunc(fun)"
                                    :compUrl="dataUrl"
                                    :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
          </div>
          <hr>
          <star-horse-table-comp ref="dictTypeRef" @selectItem="selectItemFun"
                                 :fieldList="tableFieldList"
                                 :primaryKey="primaryKey"
                                 :compUrl="dataUrl"
                                 :dataFormat="dataFormat"/>
        </el-card>
      </div>
      <div class="dict-data">
        <dictinfo-u-i :dictType="dictTypeCode"/>
      </div>
    </div>


  </el-card>
</template>
<style lang="scss" scoped>
.dict-content {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;

  .dict-type {
    width: 50%;
    height: 100%;
  }

  .dict-data {
    flex: 1;
    width: 100%;
    overflow: hidden;
    margin-left: 8px;
  }
}
</style>
