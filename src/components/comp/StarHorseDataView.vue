<script setup lang="ts" name="StarHorseDataView">
import {ApiUrls} from "@/components/types/ApiUrls";
import {inject, nextTick, onMounted, PropType, ref, watch} from "vue";
import {DialogProps} from "@/components/types/DialogProps";
import {formFieldMapping, isJson, loadById} from "@/api/sh_api";

const dataForm = ref<any>({});
const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  objectName: {type: String},
  subFormFlag: {type: String, default: "N"},
  fieldList: {type: Object, required: true},
  globalCondition: {type: Object},
  outerData: {type: Object},
  primaryKey: {type: String, default: "id"},
  batchFieldName: {type: String, default: "batchFieldList"},
  dataFormat: {type: Function, default: null}
});
const emits = defineEmits(["dataLoaded"]);
const dialogProps = inject<DialogProps>("dialogProps");
watch(() => dialogProps?.ids,
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
  if (dialogProps?.ids) {
    loadData();
  }
});
const loadData = async () => {
  await nextTick();
  let id = dialogProps?.ids instanceof Array ? dialogProps.ids[0] : dialogProps?.ids;
  if (!props.compUrl) {
    return;
  }
  let objData;
  let params = props.globalCondition || {};
  //如果是Json 对象
  if (isJson(id)) {
    params = {...params, ...id};
    objData = await loadById(props.compUrl?.loadByIdUrl!, "", true, params);
  } else {
    objData = await loadById(props.compUrl?.loadByIdUrl!, id, true, params);
  }
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
const setData = (data: any) => {
  dataForm.value = data;
}
//更新外面传进来的数据
watch(() => props.outerData,
    (val: any) => {
      if (val) {
        dataForm.value = {...dataForm.value, ...val};
      }
    }, {immediate: true, deep: true});
defineExpose({
  setData
});
</script>
<template>
  <div class="star-horse-data-view">
    <star-horse-data-view-items :commonFormat="dataFormat" :field-list="fieldList" v-model:data-form="dataForm"/>
  </div>
</template>
<style lang="scss" scoped>
.star-horse-data-view {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
}
</style>
