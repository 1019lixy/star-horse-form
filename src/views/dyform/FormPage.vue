<script setup lang="ts">
import {nextTick, onMounted, provide, reactive, ref, watch} from "vue";
import {apiInstance, closeLoad, dialogPreps, load, loadGetData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {TabsPaneContext} from "element-plus";
import {Config} from "@/api/settings.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";

let designForm = DesignForm(piniaInstance);
const starHorseTableCompRef = ref();
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref("数据加载中");
let searchFormData = ref<SearchProps[]>();
const tableFieldList = ref<any>({
      fieldList: [],
    })
;
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
const activeName = ref<string>("form");
const props = defineProps({
  param: {type: String, required: true},
});
const handleClick = (_tab: TabsPaneContext, _event: Event) => {
}
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formId: string) => {
  let {data, error} = await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formId}`
  );
  if (error) {
    errorMsg.value = error;
    hasData.value = false;
    closeLoad();
    return;
  }
  hasData.value = data && Object.keys(data).length > 0;
  console.log(hasData);
  dataUrl.value = data["dataUrl"];
  searchFormData.value = data["searchFormData"] as SearchProps[];
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = data["tableFieldList"] as PageFieldInfo;
  relationTables.value = data["relationTables"];
  rules.value = data["rules"];
  formInfo.value = data["formInfo"];
  await nextTick();
  closeLoad();
  starHorseTableCompRef.value!.init();
};
watch(
    () => props.param,
    (val) => {
      clear();
      try {
        load("数据加载中。。。");
        loadFormData(<string>val);
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

const init = async () => {
  designForm.setIsEdit(false);

  await loadFormData(props.param);
}
const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <template v-if="hasData">
    <star-horse-dialog
        :dialog-visible="dialogProps.viewVisible"
        :dialogProps="dialogProps"
        :title="'查看数据'"
        :is-view="true"
    >
        <star-horse-data-view
            :dataFormat="dataFormat"
            :primary-key="primaryKey"
            :dynamicForm="true"
            :field-list="tableFieldList"
            :compUrl="dataUrl"
        />
    </star-horse-dialog>
    <el-card class="inner_content">
      <sh-dynamic-form @refresh="starHorseTableCompRef?.loadByPage()" :compUrl="dataUrl" :formInfo="formInfo"
                       :fieldList="tableFieldList['dynamicFormas']" :rules="rules" :typeModel="'tab'"/>
    </el-card>
  </template>
</template>
<style scoped></style>
