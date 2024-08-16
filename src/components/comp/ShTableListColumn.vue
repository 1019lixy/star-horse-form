<script setup lang="ts" name="ShTableListColumn">
import {inject} from "vue";
import {DialogProps} from "@/components/types/DialogProps";

defineProps({
  dataForm: {type: Object, required: true},
  index: {type: Object, required: true},
  item: {type: Object, required: true},
  primaryKey: {type: String},
  batchName: {type: String, default: "batchDataList"},
  rules: {type: Object},
  size: {type: String, default: "small"}
});
const dialogProps = inject<DialogProps>("dialogProps");
const validMsg = (item: any) => {
  if (item.required && item.disabled != 'Y') {
    return [{'required': true, 'message': '必填项不能为空', 'trigger': 'blur'}];
  }
  return []
};
</script>
<template>
  <el-form-item
      :size="size"
      :rules="item.required?validMsg(item):[]"
      :prop="`${batchName}.${index}.${item.fieldName}`">
    <star-horse-item :primaryKey="primaryKey" :batchName="batchName" :item="item" :data-form="dataForm"
                     :isEdit="dialogProps?.ids&&dialogProps?.ids!=-1"/>
  </el-form-item>
</template>
<style scoped>
</style>
