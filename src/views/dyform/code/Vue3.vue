<script setup lang="ts">
  import { onMounted, ref, watch } from "vue";
  import { convertToCamelCase } from "@/api/star_horse_utils.ts";

  const props = defineProps({
    formInfo: { type: Object, required: true },
    compList: { type: Array, required: true },
    compSize: { type: String, required: true }
  });
  let searchFieldList: Array<any> = [];
  let formData: Array<any> = [];
  let code = ref<string>("");
  const starHorseEditorRef = ref();
  const asssignVal = (searchFields: string, formFields: string) => {
    return `<script setup lang='ts'>
import {ApiUrls} from "@\/components\/types\/ApiUrls";
import {apiInstance,dialogPreps} ""@\/api\/system.ts;
import {Config} from "@\/api\/settings.ts";
import {DialogProps} from "@\/components\/types\/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@\/components\/types\/SearchProps";
import {PageFieldInfo} from "@\/components\/types\/PageFieldInfo";
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
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
}
onMounted(() => {
  initData();
});
<\/script>
<template>
<star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form  @refresh="${convertToCamelCase(props.formInfo.tbName)}Ref.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"\/>
  <\/star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"\/>
  <\/star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp   @searchData="(data:any)=>${convertToCamelCase(props.formInfo.tbName)}Ref.createSearchParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"\/>
      <hr>
      <star-horse-button-list   @tableCompFunc="(fun:any)=>${convertToCamelCase(props.formInfo.tbName)}Ref.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"\/>
    <\/div>
    <hr>
    <star-horse-table-comp    ref="${convertToCamelCase(props.formInfo.tbName)}Ref" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"\/>
  <\/el-card>
<\/template>
<style scoped lang="scss">
<\/style>
`;
  };
  const init = () => {
    let searchFields = JSON.stringify(props.compList?.searchFormData || [], null, 4);
    let formFields = JSON.stringify(props.compList?.tableFieldList?.fieldList || [], null, 4);
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
      deep: true
    }
  );
</script>
<template>
  <div class="vue3-code">
    <div class="inner_button">
      <el-button type="primary" @click="saveFile" :size="compSize">
        <star-horse-icon icon-class="save" color="var(--star-horse-white)" />
        保存为文件
      </el-button>
    </div>
    <div class="code-editor">
      <el-scrollbar height="100%">
        <StarHorseEditor :lang="'vue'" v-model:value="code" ref="starHorseEditorRef" />
      </el-scrollbar>
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
