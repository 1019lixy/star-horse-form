<script setup lang="ts">

import FlexItem from '@/components/system/items/FlexItem.vue';
import SvgLoader from '@/components/system/SvgLoader.vue';
import { Layout } from "@/components/types/dataTypes";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { flexBoxContainerConfig } from "@/utils/flexbox/containerConfig";
import { flexBoxItemsConfig } from "@/utils/flexbox/itemsConfig";
import { flexboxLayouts } from "@/utils/flexbox/layouts";
import { gridContainerConfig } from "@/utils/grid/containerConfig";
import { gridItemsConfig } from "@/utils/grid/itemsConfig";
import { gridLayouts } from "@/utils/grid/layouts";
import FieldPanel from '@/views/dyform/FieldPanel.vue';
import { compFieldInit } from '@/views/dyform/utils/FieldOperationUtils';
import { PageFieldInfo, piniaInstance, uuid } from "star-horse-lowcode";
import { computed, defineOptions, onMounted, ref, watch } from "vue";
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
const layoutConfig = ref<Layout[]>([]);
const flexModel = ref<string>("flex");
const directions = ["column", "row-reverse", "column-reverse", "row"];
let index = 0;
const tabChange = (val: string) => {

}
const addItem = () => {
  let itemId = uuid();
  flexDesign.addItem(itemId, {});
  selectItem(itemId);
}
/**
 * 主轴方向
 */
const mainAxisDirection = () => {
  if (index > 3) {
    index = 0;
  }
  const direction = directions[index];
  containerDataForm.value["flexDirection"] = direction;
  flexDesign.setContainerDirection(direction);
  Object.entries(flexDesign.getItems()).forEach(([_key, value]) => {
    value["transform"] = "none";
    value["transformOrigin"] = "50% 50% 0px";
  });
  index++;
}
const selectItem = (itemId: string) => {
  itemDataForm.value = flexDesign.getItem(itemId);
  editTabModel.value = "item";
}
const addComp=()=>{
  flexDesign.addComp(currentId.value, {
    id: uuid(),
    type: "input",
    label: "输入框",
    formVisible:true,
    fieldName: "name",
    itemType: "item",
  });
}
/**
 * 初始化
 */
const init = () => {
  flexChange("flex");
  let layout: Layout = flexboxLayouts.find((item: Layout) => item.icon == "fillRemainingSpace")!;
  layoutOperation(layout);
};
const flexChange = (val: string) => {
  flexDesign.init();
  if (val == "flex") {
    containerConfig.value = flexBoxContainerConfig;
    itemConfig.value = flexBoxItemsConfig;
    layoutConfig.value = flexboxLayouts;
  } else {
    containerConfig.value = gridContainerConfig;
    itemConfig.value = gridItemsConfig;
    layoutConfig.value = gridLayouts;
  }
}
const layoutOperation = (item: Layout) => {
  flexDesign.init();
  const container = item.layout.container;
  const tempContainerInfo = JSON.parse(JSON.stringify(container));
  flexDesign.setContainerInfo(tempContainerInfo);
  containerDataForm.value = tempContainerInfo;
  const items = item.layout.items;
  flexDesign.batchAddItems(JSON.parse(JSON.stringify(items)));
}

onMounted(() => {
  init();
    compFieldInit().then(() => {
    console.log("初始化完成");
    //解决数据已经加载完成，但是组件属性没有加载完成的问题
  
  });
});
watch(() => currentId.value, (val: string) => {
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
          <div class="flex-grid gap-4 w-full flex-wrap">
            <template v-for="item in layoutConfig">
              <div class="flex flex-col items-center justify-center " @click="layoutOperation(item)">
                <svg-loader :path="'./flexable/' + item.icon + '.svg'" :color="'var(--star-horse-style)'" size="80px" />
                {{ item.name }}
              </div>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane name="comp">
          <template #label>
            <star-horse-icon icon-class="template" style="color: var(--star-horse-style)" />&nbsp;<span>组件</span>
          </template>
        <FieldPanel/>
        </el-tab-pane>
      </el-tabs>
    </el-splitter-panel>
    <el-splitter-panel>
      <div class=" flex flex-col mx-[10px] w-[98%] h-full">
        <div class="inner_button">
          <el-menu mode="horizontal" :ellipsis="false" style="height: inherit; width: 100%;">
            <el-menu-item :index="'1_1'" @click="addItem">
              <el-tooltip class="item" content="添加元素" effect="dark" placement="bottom">
                <star-horse-icon icon-class="add" size="24px" style="color: var(--star-horse-style)" />
              </el-tooltip>
            </el-menu-item>
            <el-menu-item :index="'1_2'" @click="mainAxisDirection">
              <el-tooltip class="item" content="主轴方向" effect="dark" placement="bottom">
                <star-horse-icon icon-class="refresh" size="24px" style="color: var(--star-horse-style)" />
              </el-tooltip>
            </el-menu-item>
          </el-menu>
          {{ containerDataForm }}
        </div>
        <div :style="containerDataForm" class="flex-1">
          <template v-for="item in positionList">
            <FlexItem :itemId="item" @selectItem="selectItem" :type="flexModel" />
          </template>
        </div>
      </div>
    </el-splitter-panel>
  </el-splitter>
</template>
<style lang="scss" scoped>
.flex-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); // 两列布局
  gap: 8px; // 间隙统一设为8px
}

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
