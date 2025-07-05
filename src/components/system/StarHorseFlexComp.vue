<script setup lang="ts">
import { flexBoxContainerConfig } from "@/utils/flexbox/containerConfig";
import { flexBoxItemsConfig } from "@/utils/flexbox/itemsConfig";

import { onMounted, ref } from "vue";
defineOptions({
  name: "StarHorseFlexComp"

})
const tabModel = ref<string>("edit");
const editTabModel = ref<string>("container");
const containerDataForm = ref<any>({});
const itemDataForm = ref<any>({});
const tabChange = (val: string) => {

}
/**
 * 初始化
 */
const init = () => {
};
onMounted(() => {
  init();
});

</script>
<template>
  <el-splitter>
    <el-splitter-panel collapsible size="300" max="50%">
      <el-tabs v-model="tabModel" style="width: 100%; height: 100%; " tab-position="left" @tabChange="tabChange"
        type="border-card">
        <el-tab-pane name="edit">
          <template #label>
            <star-horse-icon icon-class="component" style="color: var(--star-horse-style)" />&nbsp;<span>编辑</span>
          </template>
          <el-tabs v-model="editTabModel" type="border-card" style="height: unset !important;">
            <el-tab-pane name="container">
              <template #label>
                <star-horse-icon icon-class="add" style="color: var(--star-horse-style)" />&nbsp;<span>容器</span>
              </template>
              <sh-form v-model:dataForm="containerDataForm" :label-width="'auto'" :label-position="'top'">
                <StarHorseFormItem :fieldList="flexBoxContainerConfig" v-model:dataForm="containerDataForm" />
              </sh-form>
            </el-tab-pane>
            <el-tab-pane name="item">
              <template #label>
                <star-horse-icon icon-class="add" style="color: var(--star-horse-style)" />&nbsp;<span>节点</span>
              </template>
              <sh-form v-model:dataForm="itemDataForm" :label-width="'auto'" :label-position="'top'">
                <StarHorseFormItem :fieldList="flexBoxItemsConfig" v-model:dataForm="itemDataForm" />
              </sh-form>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane name="template">
          <template #label>
            <star-horse-icon icon-class="template" style="color: var(--star-horse-style)" />&nbsp;<span>模板</span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-splitter-panel>
    <el-splitter-panel>
      {{ containerDataForm }}
      <div :style="containerDataForm">
        <div :style="itemDataForm" style="height: 120px;width:150px;border: 1px solid var(--star-horse-style);">1</div>
        <div  style="height: 120px;width:150px;border: 1px solid var(--star-horse-style);">2</div>
        <div  style="height: 120px;width:150px;border: 1px solid var(--star-horse-style);">3</div>
      </div>
    </el-splitter-panel>
  </el-splitter>
</template>
<style lang="scss" scoped>
:deep {
  .el-tabs--left {
    .el-tabs__content {
      padding: 0 !important;
    }

    .el-tabs__header.is-left {
      margin-right: 5px !important;
    }

    .el-tabs__item {
      height: 80px;
      display: flex;
      padding: 10px 5px;
      align-items: center;
      justify-content: center !important;
      vertical-align: middle !important;
      writing-mode: vertical-lr;
      flex-direction: row !important;
      text-align: center;
    }

    .el-tabs--top {
      .el-tabs__content {
        padding: auto !important;
      }

      .el-tabs__header.is-left {
        margin-right: auto !important;
      }

      .el-tabs__item {
        height: 40px !important;
        display: flex;
        padding: 0 10px;
        align-items: center;
        justify-content: center !important;
        vertical-align: middle !important;
        writing-mode: unset;
        flex-direction: unset !important;
        text-align: unset;
      }
    }
  }
}
</style>
