<script setup lang="ts">
import {onMounted, PropType, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo, PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import {validMsg} from "@/api/sh_api.ts";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Object as PropType<FieldInfo>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: "small"},
  isView: {type: Boolean, default: false},
});
const dataForm = defineModel("dataForm");
const normalTabList = ref<String>("tab0");
const checkObject = (item: any) => {
  if (item && item.objectName && !Object.keys(dataForm.value).includes(item.objectName)) {
    dataForm.value[item.objectName] = {};
  }
  return 1;
}
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <star-horse-item v-if="item.type=='comp'||item.type=='button'" :primaryKey="primaryKey"
                   v-model:dataForm="dataForm"
                   :item="item"
                   :compSize="compSize"
                   :isEdit="isView"/>
  <el-form-item
      :size="compSize"
      :label="item.label"
      :required="item.required"
      :rules="item.required?validMsg(item):[]"
      :prop="item.fieldName"
      v-else-if="item.formShow">
    <star-horse-item :primaryKey="primaryKey" :compSize="compSize" v-model:dataForm="dataForm" :item="item"
                     :isEdit="isView"/>
  </el-form-item>
</template>

<style scoped lang="scss">

</style>
