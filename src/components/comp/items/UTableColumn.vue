<script setup lang="ts">
import {Config} from "@/api/settings.ts";
import {batchFieldDefaultValues} from "@/api/sh_api.ts";

defineProps({
  item: {type: Object, required: true},
  rules: {type: Object},
  staticColumn: {type: String, default: "N"},
  size: {type: String, default: "default"},
  batchName: {type: String, default: "batchDataList"},
  primaryKey: {type: String},
});
</script>

<template>
  <el-table-column
      :prop="item.fieldName"
      :label="item.label"
      sortable
      :min-width="item.minWidth||Config.defaultColumnWidth + 'px'"
      v-if="item.formShow">
    <template #default="scope">
      <template v-if="item.batchFieldList?.length>0" v-for="sitem in  item.batchFieldList">
        <star-horse-form-list
            style="min-height:100px"
            v-model:dataForm="scope.row"
            :compUrl="sitem['compUrl']"
            :primaryKey="sitem['primaryKey']"
            :batchName="sitem['batchName']"
            :initRows="sitem['initRows']"
            :subFlag="true"
            :size="size"
            :defaultValues="batchFieldDefaultValues(sitem)"
            :field-list="sitem['fieldList']"
            :rules="sitem['rules']||rules"
        />
      </template>
      <template v-else>
        <sh-table-list-column :primaryKey="primaryKey" :batchName="batchName"
                              :dataForm="scope.row"
                              :size="size"
                              :rules="rules"
                              :staticColumn="staticColumn"
                              :item="item"
                              :index="scope.$index"/>
      </template>
    </template>
  </el-table-column>
</template>

<style scoped lang="scss">

</style>
