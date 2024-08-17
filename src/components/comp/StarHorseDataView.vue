<script setup lang="ts" name="StarHorseDataView">
import {ApiUrls} from "@/components/types/ApiUrls";
import {inject, nextTick, onMounted, PropType, ref, watch} from "vue";
import {DialogProps} from "@/components/types/DialogProps";
import {commonParseCodeToName, formFieldMapping, loadById} from "@/api/sh_api";

const dataForm = ref<any>({});
const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  fieldList: {type: Object, required: true},
  globalCondition: {type: Object},
  batchFieldName: {type: String, default: "batchFieldList"},
  dataFormat: {type: Function, default: null}
});
const emits = defineEmits(["dataLoaded"]);
const dialogProps = inject<DialogProps>("dialogProps") as any;
watch(() => dialogProps.ids,
    (val) => {
      if (val == -2) {
      } else if (!val || val == -1) {
        dataForm.value = {};
      } else {
        loadData();
      }
    }, {
      // immediate: true,
      deep: true
    });
onMounted(() => {
  if (dialogProps.ids) {
    loadData();
  }
});
const loadData = async () => {
  await nextTick();
  let id = dialogProps.ids instanceof Array ? dialogProps.ids[0] : dialogProps.ids;
  if (!props.compUrl) {
    return;
  }
  let params = props.globalCondition || {};
  let objData = await loadById(props.compUrl?.loadByIdUrl!, id, true, params);
  let data = formFieldMapping(props.fieldList);
  dataForm.value = objData;
  let mapping = data.mappingFields;
  if (mapping) {
    for (let index in mapping) {
      let temp = mapping[index];
      dataForm.value[temp.name] = dataForm.value[temp.alias];
    }
  }
  await nextTick(() => {
    emits("dataLoaded", objData, true);
  });
};

const commonFormat = (name: string, cellValue: any, _row: any) => {
  cellValue = commonParseCodeToName(name, cellValue);
  if (name == "isDel") {
    return cellValue == 1 ? "是" : "否";
  }
  return null == props.dataFormat ? cellValue : props.dataFormat(name, cellValue, dataForm.value);
};


</script>
<template>
  <template v-for="item in fieldList.fieldList">
    <view-box-item :item="item" v-model:dataForm="dataForm" :commonFormat="commonFormat"/>
    <view-tab-item :item="item" v-model:dataForm="dataForm" :commonFormat="commonFormat"/>
    <view-card-item :item="item" v-model:dataForm="dataForm" :commonFormat="commonFormat"/>
    <view-collaspe-item :item="item" v-model:dataForm="dataForm" :commonFormat="commonFormat"/>
    <view-other-item :item="item" v-model:dataForm="dataForm" :commonFormat="commonFormat"/>
  </template>
  <view-table-item :item="fieldList" :batch-field-name="batchFieldName" v-model:dataForm="dataForm"
                   :commonFormat="commonFormat"/>
</template>
<style lang="scss" scoped>
</style>
