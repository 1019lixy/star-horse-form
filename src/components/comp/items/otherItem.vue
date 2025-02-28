<script setup lang="ts">
  import { onMounted, PropType } from "vue";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { FieldInfo } from "@/components/types/PageFieldInfo";
  import { validMsg } from "@/api/sh_api.ts";
  import { ModelRef } from "vue-demi";
  import { Config } from "@/api/settings.ts";

  defineProps({
    compUrl: { type: Object as PropType<ApiUrls> },
    item: { type: Object as PropType<FieldInfo>, required: true },
    objectName: { type: String },
    parentPreps: { type: Object, default: {} },
    subFormFlag: { type: String, default: "N" },
    batchName: { type: String, default: "batchDataList" },
    batchFieldName: { type: String, default: "batchFieldList" },
    primaryKey: { type: String, required: true },
    rules: { type: Object },
    compSize: { type: String, default: Config.compSize },
    isView: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false }
  });
  const dataForm: ModelRef<any> = defineModel("dataForm");
  const init = () => {};
  onMounted(() => {
    init();
  });
</script>

<template>
  <star-horse-item
    v-if="item.type == 'comp' || item.type == 'button'"
    :primaryKey="primaryKey"
    v-model:dataForm="dataForm"
    :item="item"
    :bareFlag="true"
    :compSize="compSize"
    :isEdit="isEdit"
  />

  <el-form-item
    :size="compSize"
    :label="item.preps?.hideLabel == 'Y' ? '' : item.label"
    :required="item.required"
    :rules="validMsg(item, dataForm)"
    :prop="item.fieldName"
    :label-position="parentPreps?.labelPosition"
    v-else-if="item.formVisible"
  >
    <star-horse-item
      :primaryKey="primaryKey"
      :compSize="compSize"
      v-model:dataForm="dataForm"
      :item="item"
      :isEdit="isEdit"
    />
  </el-form-item>
</template>

<style scoped lang="scss"></style>
