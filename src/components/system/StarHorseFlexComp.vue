<script setup lang="ts">

import pageItemsComponent from "@/components/formcomp/pageitems/allPageItem";
import FlexItem from '@/components/system/items/FlexItem.vue';
import PageCompPanel from '@/components/system/items/PageCompPanel.vue';
import SvgLoader from '@/components/system/SvgLoader.vue';
import { Layout } from "@/components/types/dataTypes";
import { appInstance } from '@/main';
import { useFlexDesignStore } from "@/store/FlexDesign";
import { flexBoxContainerConfig } from "@/utils/flexbox/containerConfig";
import { flexBoxItemsConfig } from "@/utils/flexbox/itemsConfig";
import { flexboxLayouts } from "@/utils/flexbox/layouts";
import { gridContainerConfig } from "@/utils/grid/containerConfig";
import { gridItemsConfig } from "@/utils/grid/itemsConfig";
import { gridLayouts } from "@/utils/grid/layouts";
import PageBackground from "@/components/system/items/PageBackground.vue";
import PageFont from "@/components/system/items/PageFont.vue";
import PageHeader from "@/components/system/items/PageHeader.vue";
import PagePosition from "@/components/system/items/PagePosition.vue";
import { PageFieldInfo, piniaInstance, uuid } from "star-horse-lowcode";
import { computed, defineOptions, onMounted, ref, watch } from "vue";
import StarHorseRuler from './StarHorseRuler.vue';
defineOptions({
  name: "StarHorseFlexComp"

});
const flexDesign = useFlexDesignStore(piniaInstance);
const positionList = computed(() => flexDesign.getPositionList());
const currentId = computed(() => flexDesign.getCurrentItem());
const tabModel = ref<string>("template");
const editTabModel = ref<string>("container");
const containerCollapse = ref<string>("container");
const itemCollapse = ref<string>("item");
const containerDataForm = ref<any>({});
const itemDataForm = ref<any>({});
const containerConfig = ref<PageFieldInfo>({});
const itemConfig = ref<PageFieldInfo>({});
const layoutConfig = ref<Layout[]>([]);
const flexModel = ref<string>("flex");
const needInfiniteViewer = ref<boolean>(true);
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
const addComp = () => {
  flexDesign.addComp(currentId.value, {
    id: uuid(),
    type: "input",
    label: "输入框",
    formVisible: true,
    fieldName: "name",
    itemType: "item",
  });
}
/**
 * 初始化
 */
const init = () => {
  appInstance.use(pageItemsComponent);
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
  tempContainerInfo["minWidth"] = "auto";
  flexDesign.setContainerInfo(tempContainerInfo);

  containerDataForm.value = tempContainerInfo;
  const items = item.layout.items;
  const tempItems = JSON.parse(JSON.stringify(items));
  tempItems.forEach((item: any) => {
    // item.styles["minWidth"] = "auto";
    item.styles["overflow"] = "hidden";
  })
  flexDesign.batchAddItems(tempItems);
}
const autoScroll = () => {
  needInfiniteViewer.value = !needInfiniteViewer.value;

}
onMounted(() => {
  init();
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
        <el-tab-pane name="template">
          <template #label>
            <star-horse-icon icon-class="template" style="color: var(--star-horse-style)" />&nbsp;<span>模板</span>
          </template>
          <div class="flex-grid gap-4 w-full flex-wrap">
            <template v-for="item in layoutConfig">
              <div class="flex flex-col items-center justify-center " @click="layoutOperation(item)">
                <svg-loader :path="'./flexable/' + item.icon" cursor="pointer" size="80px" />
                {{ item.name }}
              </div>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane name="comp">
          <template #label>
            <star-horse-icon icon-class="template" style="color: var(--star-horse-style)" />&nbsp;<span>组件</span>
          </template>
          <PageCompPanel />
        </el-tab-pane>
      </el-tabs>
    </el-splitter-panel>
    <el-splitter-panel>
      <div class=" flex flex-col  w-[99%] h-full relative" style=" margin:0 auto; background: #86909c;">
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
            <el-menu-item :index="'1_3'" @click="mainAxisDirection">
              <el-tooltip class="item" content="代码" effect="dark" placement="bottom">
                <star-horse-icon icon-class="code" size="24px" />
              </el-tooltip>
            </el-menu-item>
            <el-menu-item :index="'1_4'" @click="autoScroll">
              <el-tooltip class="item" content="无限滚动" effect="dark" placement="bottom">
                <star-horse-icon icon-class="drag" size="24px" />
              </el-tooltip>
            </el-menu-item>
          </el-menu>
        </div>
        <StarHorseRuler :needInfiniteViewer="needInfiniteViewer">
          <div :style="containerDataForm" class="flex-1">
            <template v-for="item in positionList">
              <FlexItem :itemId="item" @selectItem="selectItem" :type="flexModel" />
            </template>
          </div>
        </StarHorseRuler>
      </div>
    </el-splitter-panel>
    <el-splitter-panel collapsible size="290" max="40%">
      <el-tabs v-model="editTabModel" type="border-card" style="height: 100% !important; ">
        <el-tab-pane name="container">
          <template #label>
            <star-horse-icon icon-class="container" style="color: var(--star-horse-style)" />&nbsp;<span>容器</span>
          </template>
          <sh-form v-model:dataForm="containerDataForm" :label-width="'auto'" :label-position="'top'">
            <el-collapse v-model="containerCollapse" style="background: #1d2129 !important">
              <el-collapse-item name="container">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>布局</div>
                  </div>
                </template>
                <div class="h-full">
                  <StarHorseFormItem :fieldList="containerConfig" v-model:dataForm="containerDataForm" />
                </div>
              </el-collapse-item>
              <el-collapse-item name="position">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>位置大小</div>
                  </div>
                </template>
                <page-position v-model:dataForm="containerDataForm" />
              </el-collapse-item>
              <el-collapse-item name="background">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>背景</div>
                  </div>
                </template>
                <page-background v-model:dataForm="containerDataForm" />
              </el-collapse-item>
              <el-collapse-item name="font">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>文字</div>
                  </div>
                </template>
                <page-font v-model:dataForm="containerDataForm" />
              </el-collapse-item>
            </el-collapse>
          </sh-form>
        </el-tab-pane>
        <el-tab-pane name="item">
          <template #label>
            <star-horse-icon icon-class="list" style="color: var(--star-horse-style)" />&nbsp;<span>节点</span>
          </template>

          <el-collapse v-model="itemCollapse" :expand-icon-position="'left'" style="background: #1d2129 !important">
            <el-collapse-item name="item">
              <template #title>
                <div class="collapse-item-title title">
                  <div>布局</div>
                </div>
              </template>
              <sh-form v-model:dataForm="itemDataForm" :label-width="'auto'" :label-position="'top'">
                <StarHorseFormItem :fieldList="itemConfig" v-model:dataForm="itemDataForm" />
              </sh-form>
            </el-collapse-item>
            <el-collapse-item name="position">
              <template #title>
                <div class="collapse-item-title title">
                  <div>位置大小</div>
                </div>
              </template>
              <page-position v-model:dataForm="itemDataForm" />
            </el-collapse-item>
            <el-collapse-item name="background">
              <template #title>
                <div class="collapse-item-title title">
                  <div>背景</div>
                </div>
              </template>
              <page-background v-model:dataForm="itemDataForm" />
            </el-collapse-item>
            <el-collapse-item name="font">
              <template #title>
                <div class="collapse-item-title title">
                  <div>文字</div>
                </div>
              </template>
              <page-font v-model:dataForm="itemDataForm" />
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
      </el-tabs>
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
