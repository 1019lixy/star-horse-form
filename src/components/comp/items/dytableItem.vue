<script setup lang="ts">
  import { onMounted, PropType } from "vue";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { PageFieldInfo } from "@/components/types/PageFieldInfo";
  import { ModelRef } from "vue-demi";
  import { validMsg } from "@/api/sh_api.ts";
  import { Config } from "@/api/settings.ts";

  defineProps({
    compUrl: { type: Object as PropType<ApiUrls> },
    item: { type: Object as PropType<PageFieldInfo>, required: true },
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
  <template v-if="item.dytableList && item.dytableList.length > 0">
    <table ref="containerTableRef" :class="{ 'dynamic-table': true, 'instance-table': true }">
      <tbody>
        <tr v-for="(row, rowIndex) in item.dytableList" class="dy-tr">
          <td
            v-for="(sitem, colIndex) in row"
            :colspan="sitem.preps?.colspan || 1"
            :rowspan="sitem.preps?.rowspan || 1"
            :style="{
              width: sitem.preps?.colWidth + '% !important' || '',
              height: sitem.preps?.colHeight + '% !important' || '',
              'white-space': 'nowrap',
              'word-break': !!sitem.preps?.wordBreak ? 'break-all' : 'keep-all'
            }"
          >
            <el-form-item
              :size="compSize"
              :label="sitem.label"
              :required="sitem.required"
              :prop="sitem.fieldName"
              :label-position="parentPreps?.labelPosition"
              :rules="validMsg(sitem, dataForm)"
              v-if="sitem.formVisible && sitem.label && sitem.preps?.headerFlag != 'Y'"
            >
              <star-horse-item
                :primaryKey="primaryKey"
                :compSize="compSize"
                v-model:dataForm="dataForm"
                :item="sitem"
                :isEdit="isEdit"
              />
            </el-form-item>
            <star-horse-item
              v-else-if="sitem.formVisible || sitem.viewVisible"
              :compSize="compSize"
              :primaryKey="primaryKey"
              v-model:dataForm="dataForm"
              :item="sitem"
              :isEdit="isEdit"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </template>
</template>

<style scoped lang="scss">
  .instance-table {
    width: 100%;
    height: 100%;
    table-layout: fixed;

    td {
      line-height: 40px;
      height: 40px;
      padding: 0 10px 0 0;
    }
  }
</style>
