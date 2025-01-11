<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {validMsg} from "@/api/sh_api.ts";
import {Config} from "@/api/settings.ts";

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  parentPreps:{type:Object,default:{}},
  subFormFlag: {type: String, default: "N"},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: Config.compSize},
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
            :label-position="parentPreps?.labelPosition"
            :rules="sitem.required?validMsg(sitem,dataForm):sitem.rules||[]"
            v-if="sitem.formVisible&&sitem.label&&sitem.preps?.headerFlag!='Y'">
          <star-horse-item :primaryKey="primaryKey" :compSize="compSize" v-model:dataForm="dataForm"
                           :item="sitem"
                           :isEdit="isEdit"/>
        </el-form-item>
        <star-horse-item v-else-if="sitem.formVisible||sitem.viewVisible" :compSize="compSize" :primaryKey="primaryKey"
                         v-model:dataForm="dataForm"
                         :item="sitem"
                         :isEdit="isEdit"/>
      </el-col>
      <el-col :span="sitem.colspan||sitem.preps?.colspan||(24/item.length)"
              v-else>
        <star-horse-item :primaryKey="primaryKey" :compSize="compSize" v-model:dataForm="dataForm"
                         :item="sitem"
                         :isEdit="isEdit"/>
      </el-col>

    </template>
  </el-row>
</template>

<style scoped lang="scss">

</style>
