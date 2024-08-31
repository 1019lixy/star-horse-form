<script setup lang="ts" name="StarHorseFormItem">
import {onMounted, ref} from "vue";
import {batchFieldDefaultValues} from "@/api/sh_api.ts";
import {ModelRef} from "vue-demi";

defineProps({
  item: {type: Object, required: true},
  rules: {type: Object},
  size: {type: String, default: "default"}
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const currentTableRef = ref();
onMounted(() => {
  //console.log(dataForm);
});
</script>
<template>
  <star-horse-form-list
      style="min-height:100px"
      v-model:dataForm="dataForm"
      :compUrl="item['compUrl']"
      :primaryKey="item['primaryKey']"
      :batchName="item['batchName']"
      :initRows="item['initRows']"
      :batchUrl="item['batchUrl']"
      :title="item['title']"
      :size="size"
      v-if="!item['disVisible']"
      :helpMsg="item['helpMsg']"
      :staticColumn="item.staticData||'N'"
      :downloadTemplateUrl="item['downloadTemplateUrl']"
      :importInfo="item['importInfo']"
      :defaultValues="batchFieldDefaultValues(item)"
      ref="currentTableRef"
      :fieldList="item['fieldList']"
      :rules="item['rules']||rules"
  />
</template>
<style lang="scss" scoped>
</style>
