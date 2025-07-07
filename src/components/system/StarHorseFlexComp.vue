<script setup lang="ts">

import { flexBoxContainerConfig } from "@/utils/flexbox/containerConfig";
import { flexBoxItemsConfig } from "@/utils/flexbox/itemsConfig";
import { gridContainerConfig } from "@/utils/grid/containerConfig";
import { gridItemsConfig } from "@/utils/grid/itemsConfig";
import { PageFieldInfo, piniaInstance, uuid } from "star-horse-lowcode";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { onMounted, ref, computed, defineOptions,watch } from "vue";
import FlexItem from '@/components/system/items/FlexItem.vue';
defineOptions({
  name: "StarHorseFlexComp"

});
const flexDesign = useFlexDesignStore(piniaInstance);
const positionList = computed(() => flexDesign.getPositionList());
const currentId = computed(() => flexDesign.getCurrentItem());
const tabModel = ref<string>("edit");
const editTabModel = ref<string>("container");
const containerDataForm = ref<any>({});
const itemDataForm = ref<any>({});
const containerConfig = ref<PageFieldInfo>({});
const itemConfig = ref<PageFieldInfo>({});
const flexModel = ref<string>("flex");
const tabChange = (val: string) => {

}
const addItem = () => {
  let itemId = uuid();
  flexDesign.addItem(itemId, {});
  selectItem(itemId);
}
const selectItem = (itemId: string) => {
  itemDataForm.value = flexDesign.getItem(itemId);
}
/**
 * 初始化
 */
const init = () => {
  flexDesign.init();
  flexChange("flex");
  //测试，初始化5个div
  for (let i = 0; i < 5; i++) {
    addItem();
  }
};
const flexChange = (val: string) => {
  if (val == "flex") {
    containerConfig.value = flexBoxContainerConfig;
    itemConfig.value = flexBoxItemsConfig;
  } else {
    containerConfig.value = gridContainerConfig;
    itemConfig.value = gridItemsConfig;
  }
}
onMounted(() => {
  init();
});
watch(() => currentId.value, (val) => {
  selectItem(val);
});
</script>
<template>

  <el-splitter>
    <el-splitter-panel collapsible size="300" max="50%" class="flex flex-col">
      <div class="inner_button">
        <el-select v-model="flexModel" class="" @change="flexChange">
          <el-option value="flex" label="Flex" />
          <el-option value="grid" label="FlexGrid" />
        </el-select>
      </div>
      <el-tabs v-model="tabModel" class="flex-1" tab-position="left" @tabChange="tabChange" type="border-card">
        <el-tab-pane name="edit">
          <template #label>
            <star-horse-icon icon-class="component" style="color: var(--star-horse-style)" />&nbsp;<span>编辑</span>
          </template>
          <el-tabs v-model="editTabModel" type="border-card" style="height: 100% !important; ">
            <el-tab-pane name="container">
              <template #label>
                <star-horse-icon icon-class="add" style="color: var(--star-horse-style)" />&nbsp;<span>容器</span>
              </template>
              <div class="h-full">
                <sh-form v-model:dataForm="containerDataForm" :label-width="'auto'" :label-position="'top'">
                  <StarHorseFormItem :fieldList="containerConfig" v-model:dataForm="containerDataForm" />
                </sh-form>
              </div>
            </el-tab-pane>
            <el-tab-pane name="item">
              <template #label>
                <star-horse-icon icon-class="add" style="color: var(--star-horse-style)" />&nbsp;<span>节点</span>
              </template>
              <sh-form v-model:dataForm="itemDataForm" :label-width="'auto'" :label-position="'top'">
                <StarHorseFormItem :fieldList="itemConfig" v-model:dataForm="itemDataForm" />
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
      <div class=" flex flex-col mx-[10px]">
        <div class="inner_button">
          <el-menu mode="horizontal" :ellipsis="false" style="height: inherit; width: 100%;">
            <el-menu-item :index="'1_1'" @click="addItem">
              <el-tooltip class="item" content="添加元素" effect="dark" placement="bottom">
                <star-horse-icon icon-class="add" size="24px" style="color: var(--star-horse-style)" />
              </el-tooltip>
            </el-menu-item>
          </el-menu>
        </div>
        {{ currentId }}
        <div :style="containerDataForm" class="flex-1">
          <template v-for="item in positionList">
            <FlexItem :itemId="item" @selectItem="selectItem" />
          </template>
        </div>
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
