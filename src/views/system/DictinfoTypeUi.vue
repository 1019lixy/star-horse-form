<script setup lang="ts" name="DictinfoType">
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields, SearchParams} from "star-horse-lowcode";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref} from "vue";

const dataUrl: ApiUrls = apiInstance("system-config", "system/dictinfoType");
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "名称", defaultVisible: false, matchType: "lk", fieldName: "dictTypeName", type: "input"},
    {label: "编码", defaultVisible: true, matchType: "eq", fieldName: "dictTypeCode", type: "input"}
  ]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idDictinfoType",
      type: "long"
    },
    {
      label: "字典类型名称",
      fieldName: "dictTypeName",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "字典类型编码",
      fieldName: "dictTypeCode",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "textarea",
      formVisible: true,
      listVisible: true
    }
  ]
  //在表格右侧添加自定义功能
});
const primaryKey = "idDictinfoType";
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (_name: string, cellValue: object): any => {
  return cellValue;
};
let dictTypeCode = ref<string>("");
const dictTypeRef = ref();
const dictTypeFormRef = ref();
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
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="dictTypeRef.loadByPage()"
        :compUrl="dataUrl"
        ref="dictTypeFormRef"
        :fieldList="tableFieldList"
        :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <el-splitter>
      <el-splitter-panel collapsible>
        <el-card class="inner_content">
          <div class="search-content">
            <div class="search_btn"
                 :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
              <star-horse-search-comp
                  @searchData="(data: any) => dictTypeRef.createSearchParams(data)"
                  :formData="searchFormData"
                  :compUrl="dataUrl"
              />
            </div>
          </div>
          <star-horse-table-comp
              ref="dictTypeRef"
              @selectItem="selectItemFun"
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
      </el-splitter-panel>
      <el-splitter-panel collapsible>
        <div class="h-full overflow-hidden">
          <dictinfo-u-i :dictType="dictTypeCode"/>
        </div>
      </el-splitter-panel>
    </el-splitter>

  </el-card>
</template>
<style lang="scss" scoped>
</style>
