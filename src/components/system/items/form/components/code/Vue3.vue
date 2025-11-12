<script setup lang="ts">
import { onMounted, PropType, ref, watch } from "vue";
import { convertToCamelCase } from "star-horse-lowcode";

const props = defineProps({
  formInfo: { type: Object as PropType<any>, required: true },
  compList: { type: Object as PropType<any>, required: true },
  compSize: { type: String, required: true },
});
let code = ref<string>("");
const starHorseEditorRef = ref();
const asssignVal = (searchFields: string, formFields: string) => {
  return `<script setup lang='ts'>
import {onMounted, provide, reactive, ref} from "vue";
import {ApiUrls,apiInstance,dialogPreps,DialogProps,SearchProps,PageFieldInfo} from "star-horse-lowcode";
const searchFormData = reactive<Array<SearchProps>>(${searchFields});
const tableFieldList = reactive<PageFieldInfo>({
    fieldList:${formFields}
});
const primaryKey = "${props.formInfo.formId}";
let appName="需要手动添加";
let interfacePrefix="需要手动添加";
const dataUrl: ApiUrls =apiInstance(appNmae,interfacePrefix);
const initData = async () => {
};
const ${convertToCamelCase(props.formInfo.tbName)}Ref = ref();
const rules = {};
const dialogProps =dialogPreps();
provide("dialogProps", dialogProps);
/**
* 数据格式化
* @param name 字段名称
* @param cellValue 字段值
* @param row 行数据
*/
const dataFormat = (name: string, cellValue: any,row:any): any => {
  return cellValue;
}
onMounted(() => {
  initData();
});
<\/script>
<template>
<div class="flex flex-col h-full overflow-hidden">
<star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form  @refresh="${convertToCamelCase(props.formInfo.tbName)}Ref?.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"\/>
  <\/star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps"  :source="3">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"\/>
  <\/star-horse-dialog>
  <div class="search-content">
   <div class="search_btn">
      <star-horse-search-comp   @searchData="(data:any)=>${convertToCamelCase(props.formInfo.tbName)}Ref?.createSearchParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"\/>
    <\/div>
   <\/div>
  <el-card class="inner_content">
    <star-horse-table-comp    ref="${convertToCamelCase(props.formInfo.tbName)}Ref" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"\/>
  <\/el-card>
  <\/div>
<\/template>
<style scoped lang="scss">
<\/style>
`;
};
const init = () => {
  let searchFields = JSON.stringify(
    props.compList?.searchFormData || [],
    null,
    4,
  );
  let formFields = JSON.stringify(
    props.compList?.tableFieldList?.fieldList || [],
    null,
    4,
  );
  code.value = asssignVal(searchFields, formFields);
  if (starHorseEditorRef.value) {
    starHorseEditorRef.value.setValue(code.value);
  }
};
const saveFile = () => {
  let blob = new Blob([code.value]);
  let delement = document.createElement("a");
  let href = window.URL.createObjectURL(blob);
  delement.href = href;
  let name = convertToCamelCase(props.formInfo.tbName) + ".vue";
  name = name.substring(0, 1).toUpperCase() + name.substring(1);
  delement.download = name;
  document.body.appendChild(delement);
  delement.click();
  document.body.removeChild(delement);
  window.URL.revokeObjectURL(href);
};
onMounted(() => {
  init();
});
watch(
  () => props.compList,
  () => {
    init();
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>
<template>
  <div class="vue3-code">
    <div class="code-editor">
      <el-scrollbar height="100%">
        <StarHorseEditor
          :lang="'vue'"
          v-model:value="code"
          ref="starHorseEditorRef"
        />
      </el-scrollbar>
    </div>
    <div class="inner_button">
      <el-button type="primary" @click="saveFile" :size="compSize">
        <star-horse-icon
          icon-class="save"
          size="16px"
          color="var(--star-horse-white)"
        />
        保存为文件
      </el-button>
    </div>
  </div>
</template>
<style scoped lang="scss">
.vue3-code {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .code-editor {
    flex: 1;
    overflow: hidden;
  }
}
</style>
