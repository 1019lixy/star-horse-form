<script setup lang="ts">
import {onMounted, provide, reactive, ref, watch} from "vue";
import {closeLoad, load} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {useRouter} from "vue-router";
import {DialogProps} from "@/components/types/DialogProps";
import {SearchProps} from "@/components/types/SearchProps";
import DataPreview from "@/views/dyform/DataPreview.vue";
import {analysisSearchData, viewColumns, viewDataList} from "@/views/dyform/utils/preview";
import {download} from "@/api/star_horse";
import {error} from "@/utils/message";
import {Config} from "@/api/settings";

const router = useRouter();
const props = defineProps({
  param: {type: String, required: true},
});
const dataUrl = ref<ApiUrls>({
  uploadUrl: "",
  batchMergeDraftUrl: "",
  batchMergeUrl: "",
  deleteUrl: "",
  downloadTemplateUrl: "",
  exportAllUrl: `/userdb-manage/consumer/api/exportData/${props.param}`,
  loadByIdUrl: "",
  loadByPageUrl: "",
  mergeDraftUrl: "",
  mergeUrl: "",
  importUrl: "",
  userConditionUrl: ""
});
const errorMsg = ref("数据加载中");
let searchFormData = ref<SearchProps[]>([]);
const tableFieldList = ref<any>({
  fieldList: [],
  batchFieldList: [],
  userTableFuncs: [],
  stopAutoLoad: false,
});
/**
 * 表单数据直接取定义的数据preps,
 * 列表数据重新定义，方便排序和位置拖拽
 */
const primaryKey = ref<string>("");
const rules = ref<any>({});
const hasData = ref<boolean>(false);
const formInfo = ref<any>({});
const previewDatas = ref<any>({});

const clear = () => {
  hasData.value = false;
};
const exportData = () => {
  load("数据处理中");
  let params = {
    fieldList: analysisSearchData(searchForm.value, searchFormData.value),
    pageSize: 100,
    currentPage: 1
  }
  download(dataUrl.value.exportAllUrl, params).catch(err => {
    error("接口不存在或网络异常:" + err);
  }).finally(() => {
    closeLoad();
  });
};
const columnList = ref([]);
const loadColumnFields = async () => {
  searchFormData.value = [];
  columnList.value = [];
  let {formDatas, columns} = await viewColumns(props.param);
  searchFormData.value = formDatas;
  columnList.value = columns;
}
const loadFormData = async (currentPage: number, pageSize: number) => {
  let {viewDatas, error} = await viewDataList(props.param, currentPage, pageSize,
      analysisSearchData(searchForm.value, searchFormData.value));
  if (error) {
    errorMsg.value = error;
    hasData.value = false;
    closeLoad();
    return;
  } else {
    hasData.value = viewDatas && Object.keys(viewDatas).length > 0;
    previewDatas.value = viewDatas;
  }
};
//监听数据变化
watch(
    () => props.param,
    (val) => {
      clear();
      try {

        if (props.param) {
          load("数据加载中。。。");
          loadColumnFields();
          loadFormData(1, 20);
        }
      } catch (e) {
        closeLoad();
        console.log("数据类型不匹配");
      }
    },
    {deep: true}
);

onMounted(() => {
  loadColumnFields();
  loadFormData(1, 20);
});
const searchForm = ref({});
provide("searchForm", searchForm);
const dataForm = ref({});
provide("dataForm", dataForm);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false,
  bakeVisible2: false,
  bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false
});
provide("dialogProps", dialogProps);
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
};
</script>

<template>
  <template v-if="hasData">
    <star-horse-dialog
        :dialog-visible="dialogProps.editVisible"
        :dialogProps="dialogProps"
    >
      <sh-dynamic-form @refresh="starHorseTableCompRef?.loadByPage()" :compUrl="dataUrl" :formInfo="formInfo"
                       :fieldList=
                           "tableFieldList.dynamicFormas" :rules="rules"/>
    </star-horse-dialog>
    <star-horse-dialog
        :dialog-visible="dialogProps.viewVisible"
        :dialogProps="dialogProps"
        :title="'查看数据'"
        :is-view="true"
    >
      <star-horse-data-view
          :dataFormat="dataFormat"
          :field-list="tableFieldList"
          :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
        <star-horse-search-comp @searchData="(data)=>starHorseTableCompRef.createCreateParams(data)"
                                :formData="searchFormData"
                                :compUrl="dataUrl"/>
        <hr/>
        <star-horse-button-list @tableCompFunc="(fun)=>starHorseTableCompRef.tableCompFunc(fun)" :viewFlag="true"
                                :compUrl="dataUrl" :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
      </div>
      <hr>
      <DataPreview ref="starHorseTableCompRef" :item="previewDatas" :columns="columnList" @exportData="exportData"
                   @changePage="loadFormData"/>
    </el-card>
  </template>

</template>

<style scoped></style>
