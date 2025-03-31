<script setup lang="ts">
import {computed, onMounted, provide, reactive, ref, watch} from "vue";
import {apiInstance, closeLoad, dialogPreps, load} from "@/api/star_horse_utils.ts";
import DataPreview from "@/views/dyform/DataPreview.vue";
import {analysisSearchData, viewColumns, viewDataList} from "@/views/dyform/utils/preview";
import {download} from "@/api/star_horse_apis.ts";
import {error} from "@/utils/message";
import {Config} from "@/api/settings.ts";
import {useDesignFormStore,useGlobalConfigStore,SearchProps} from "star-horse-lowcode";
import {piniaInstance} from "star-horse-lowcode";

let designForm = useDesignFormStore(piniaInstance);
const props = defineProps({
  param: {type: String, required: true},
  isPreview: {type: Boolean, default: false}
});
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);

const dataUrl = apiInstance("userdb-manage", "consumer/api");
dataUrl.exportAllUrl = `${dataUrl.basePrefix}/exportData/${props.param}`;
const errorMsg = ref("数据加载中");
let searchFormData = ref<SearchProps[]>([]);
const tableFieldList = ref<any>({
  fieldList: []
});
/**
 * 表单数据直接取定义的数据preps,
 * 列表数据重新定义，方便排序和位置拖拽
 */
const primaryKey = ref<string>("");
const viewSearchRef = ref();
const rules = ref<any>({});
const hasData = ref<boolean>(false);
const formInfo = ref<any>({});
const previewDatas = ref<any>({});
const starHorseTableCompRef = ref();
const clear = () => {
  hasData.value = false;
};
const exportData = () => {
  load("数据处理中");
  let params = {
    fieldList: viewSearchRef.value.createSearchParams(searchFormData.value),
    pageSize: 100,
    currentPage: 1
  };
  download(dataUrl.exportAllUrl!, params)
      .catch((err) => {
        error("接口不存在或网络异常:" + err);
      })
      .finally(() => {
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
};
const loadFormData = async (currentPage: number, pageSize: number) => {
  let {viewDatas, error} = await viewDataList(
      props.param,
      currentPage,
      pageSize,
      analysisSearchData(viewSearchRef.value?.searchForm || {}, searchFormData.value)
  );
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
    () => {
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
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const init = async () => {
  designForm.setIsEdit(false);
  await loadColumnFields();
  await loadFormData(1, 20);
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <template v-if="hasData">
    <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
      <sh-dynamic-form
          @refresh="starHorseTableCompRef?.loadByPage()"
          :compUrl="dataUrl"
          :formInfo="formInfo"
          :fieldList="tableFieldList.dynamicFormas"
          :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
        :dialog-visible="dialogProps.viewVisible"
        :dialogProps="dialogProps"
        :title="'查看数据'"
        :is-view="true"
    >
      <star-horse-data-view
          :dataFormat="dataFormat"
          :data-list="primaryKey"
          :field-list="tableFieldList"
          :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <div
          class="search_btn"
          :style="{ display: 'flex', 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }"
      >
        <star-horse-search-comp
            ref="viewSearchRef"
            @searchData="(data: any) => starHorseTableCompRef.createSearchParams(data)"
            :formData="searchFormData"
            :compUrl="dataUrl"
        />
        <hr v-if="Config.buttonStyle.value == 'line'"/>
        <star-horse-button-list
            @tableCompFunc="(fun: any) => starHorseTableCompRef.tableCompFunc(fun)"
            :viewFlag="true"
            :compUrl="dataUrl"
            :dialogProps="dialogProps"
            :showType="Config.buttonStyle"
        />
      </div>
      <hr/>
      <DataPreview
          ref="starHorseTableCompRef"
          :item="previewDatas"
          :columns="columnList"
          @exportData="exportData"
          @changePage="loadFormData"
          :isPreview="isPreview"
          :compSize="compSize"
      />
    </el-card>
  </template>
</template>
<style scoped></style>
