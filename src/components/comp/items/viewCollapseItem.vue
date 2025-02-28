<script setup lang="ts">
  import { onMounted, PropType } from "vue";
  import { FieldInfo } from "@/components/types/PageFieldInfo";
  import { ModelRef } from "vue-demi";

  defineProps({
    item: { type: Array as PropType<Array<FieldInfo>>, required: true },
    objectName: { type: String },
    subFormFlag: { type: String, default: "N" },
    batchName: { type: String, default: "batchDataList" },
    batchFieldName: { type: String, default: "batchFieldList" },
    commonFormat: { type: Function, required: true }
  });
  const dataForm: ModelRef<any> = defineModel("dataForm");
  const checkObject = (item: any) => {
    if (item && item.objectName && !Object.keys(dataForm.value).includes(item.objectName)) {
      dataForm.value[item.objectName] = {};
    }
    return 1;
  };
  const init = () => {};
  onMounted(() => {
    init();
  });
</script>

<template>
  <template v-if="item.collapseList && item.collapseList.length > 0">
    <el-collapse v-model="item.fieldName">
      <template v-for="(collapseItem, key) in item.collapseList">
        <el-collapse-item
          v-if="Object.keys(collapseItem).length > 0"
          :title="collapseItem.title"
          :name="collapseItem.tabName || key"
          :index="checkObject(collapseItem)"
        >
          <el-scrollbar height="95%">
            <star-horse-data-view-items
              v-model:dataForm="dataForm[collapseItem.objectName]"
              :objectName="collapseItem.objectName"
              :commonFormat="commonFormat"
              :fieldList="{
                ...collapseItem
              }"
              :subFormFlag="collapseItem.subFormFlag"
            />
          </el-scrollbar>
        </el-collapse-item>
      </template>
    </el-collapse>
  </template>
</template>

<style scoped lang="scss">
  .el-collapse {
    :deep(.el-collapse-item__header) {
      border: 1px solid var(--star-horse-style);
      margin-top: 5px;
      height: 40px;
      padding-left: 15px;
    }

    :deep(.el-collapse-item__content) {
      padding: 5px 10px;
    }

    :deep(.el-collapse-item__wrap) {
      margin-top: 10px;
      border: unset;
    }
  }
</style>
