<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {validMsg} from "@/api/sh_api.ts";

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: "default"},
  isView: {type: Boolean, default: false},
  isEdit: {type: Boolean, default: false},
});
const dataForm = defineModel("dataForm");
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>

  <el-row v-if="item instanceof Array" :gutter="10">
    <template v-for="sitem in item">
      <el-col :span="sitem.colspan||sitem.preps?.colspan||(24/item.length)"
              v-if="sitem.type!='button'&&sitem.type!='comp'">
        <el-form-item
            :size="compSize"
            :label="sitem.preps?.hideLabel=='Y'?'':sitem.label"
            :required="sitem.required"
            :prop="sitem.fieldName"
            :rules="sitem.required?validMsg(sitem):[]"
            v-if="sitem.formShow&&sitem.label&&sitem.preps?.headerFlag!='Y'">
          <star-horse-item :primaryKey="primaryKey" :compSize="compSize" v-model:dataForm="dataForm"
                           :item="sitem"
                           :isEdit="isEdit"/>
        </el-form-item>
        <star-horse-item v-else-if="sitem.formShow||sitem.viewShow" :compSize="compSize" :primaryKey="primaryKey"
                         v-model:dataForm="dataForm"
                         :item="sitem"
                         :isEdit="isEdit"/>
      </el-col>
    </template>
  </el-row>
</template>

<style scoped lang="scss">

</style>
