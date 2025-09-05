<script setup lang="ts">
import {
  type FlexDesignData,
  loadFlexDesign,
  type PublishResult,
  saveFlexDesign,
  type ShareResult,
} from "@/api/flexDesign";
import pageItemsComponent from "@/components/formcomp/pageitems/allPageItem";
import FlexPreviewDialog from "@/components/system/dialogs/FlexPreviewDialog.vue";
import FlexPublishDialog from "@/components/system/dialogs/FlexPublishDialog.vue";
import FlexSaveDialog from "@/components/system/dialogs/FlexSaveDialog.vue";
import FlexShareDialog from "@/components/system/dialogs/FlexShareDialog.vue";
import FlexItem from "@/components/system/items/FlexItem.vue";
import PageBackground from "@/components/system/items/PageBackground.vue";
import PageCompPanel from "@/components/system/items/PageCompPanel.vue";
import PageFont from "@/components/system/items/PageFont.vue";
import PagePosition from "@/components/system/items/PagePosition.vue";
import PageItemProperties from "@/components/system/items/PageItemProperties.vue";
import SvgLoader from "@/components/system/SvgLoader.vue";
import { Layout } from "@/components/types/dataTypes";
import { appInstance } from "@/main";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { flexBoxContainerConfig } from "@/utils/flexbox/containerConfig";
import { flexBoxItemsConfig } from "@/utils/flexbox/itemsConfig";
import { flexboxLayouts } from "@/utils/flexbox/layouts";
import { gridContainerConfig } from "@/utils/grid/containerConfig";
import { gridItemsConfig } from "@/utils/grid/itemsConfig";
import { gridLayouts } from "@/utils/grid/layouts";

import {
  error,
  PageFieldInfo,
  piniaInstance,
  success,
  uuid,
} from "star-horse-lowcode";
import {
  computed,
  defineOptions,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import StarHorseRuler from "./StarHorseRuler.vue";

defineOptions({
  name: "StarHorseFlexComp",
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
const compDataForm = ref<any>({});
const containerConfig = ref<PageFieldInfo>({});
const itemConfig = ref<PageFieldInfo>({});
const layoutConfig = ref<Layout[]>([]);
const flexModel = ref<string>("flex");
const needInfiniteViewer = ref<boolean>(true);
const hideRuler = ref<boolean>(false);
const isFullscreen = ref(false);
// Add this new ref for tracking selected component
const selectedComponentId = ref<string>("");
const directions = ["column", "row-reverse", "column-reverse", "row"];

// Dialog states
const saveDialogVisible = ref(false);
const previewDialogVisible = ref(false);
const shareDialogVisible = ref(false);
const publishDialogVisible = ref(false);

// Design metadata
const currentDesignId = ref<string>("");
const currentDesignName = ref<string>("未命名设计");
const currentDesignDescription = ref<string>("");

let index = 0;
const tabChange = (val: string) => {};
const addItem = () => {
  let itemId = uuid();
  flexDesign.addItem(itemId, {});
  selectItem(itemId);
};
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
};
const selectItem = (itemId: string) => {
  itemDataForm.value = flexDesign.getItem(itemId);
  editTabModel.value = "item";
  // Reset selected component when selecting a different item
  selectedComponentId.value = "";
};

// Add this new function to handle component selection within an item
const selectComponent = (itemId: string, componentId: string) => {
  // Select the item first
  selectItem(itemId);
  // Set the selected component ID
  selectedComponentId.value = componentId;
  // Then switch to the component properties tab
  editTabModel.value = "compPreps";
};

// Add this new function to handle when no item is selected (container is clicked)
const selectContainer = () => {
  // Clear the item data form when container is selected
  itemDataForm.value = {};
  editTabModel.value = "container";
  // Reset selected component when selecting container
  selectedComponentId.value = "";
};



const addComp = () => {
  flexDesign.addComp(currentId.value, {
    id: uuid(),
    type: "input",
    label: "输入框",
    formVisible: true,
    fieldName: "name",
    itemType: "item",
  });
};
/**
 * 初始化
 */
const init = () => {
  appInstance.use(pageItemsComponent);
  flexChange("flex");
  let layout: Layout = flexboxLayouts.find(
    (item: Layout) => item.icon == "fillRemainingSpace",
  )!;
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
};
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
  });
  flexDesign.batchAddItems(tempItems);
};
const autoScroll = () => {
  needInfiniteViewer.value = !needInfiniteViewer.value;
};
const hideRulerFunc = () => {
  hideRuler.value = !hideRuler.value;
};
const saveData = () => {
  saveDialogVisible.value = true;
};

const preview = () => {
  // 验证设计数据
  const validation = flexDesign.validateDesign();
  if (!validation.isValid) {
    error("设计数据验证失败，请检查设计内容");
    console.warn("验证错误:", validation.errors);
    return;
  }
  previewDialogVisible.value = true;
};

const publishPage = () => {
  // 验证设计数据
  const validation = flexDesign.validateDesign();
  if (!validation.isValid) {
    error("设计数据验证失败，无法发布");
    console.warn("验证错误:", validation.errors);
    return;
  }
  publishDialogVisible.value = true;
};

const sharePage = () => {
  // 验证设计数据
  const validation = flexDesign.validateDesign();
  if (!validation.isValid) {
    error("设计数据验证失败，无法分享");
    console.warn("验证错误:", validation.errors);
    return;
  }
  shareDialogVisible.value = true;
};

// Dialog event handlers
const handleSaved = (result: FlexDesignData) => {
  currentDesignId.value = result.id || "";
  currentDesignName.value = result.name;
  currentDesignDescription.value = result.description || "";
  saveDialogVisible.value = false;
  success("设计保存成功");
};

const handleShared = (result: ShareResult) => {
  shareDialogVisible.value = false;
  success("分享链接生成成功");
  console.log("分享结果:", result);
};

const handlePublished = (result: PublishResult) => {
  publishDialogVisible.value = false;
  success("设计发布成功");
  console.log("发布结果:", result);
};

const handleSaveTemplate = (templateData: any) => {
  console.log("保存模板:", templateData);
  success("模板保存成功");
  previewDialogVisible.value = false;
};

// Load design data
const loadDesign = async (designId: string) => {
  try {
    const designData = await loadFlexDesign(designId);
    flexDesign.loadDesignData(designData);
    currentDesignId.value = designData.id || "";
    currentDesignName.value = designData.name;
    currentDesignDescription.value = designData.description || "";
    success("设计加载成功");
  } catch (err) {
    console.error("加载设计失败:", err);
    error("加载设计失败");
  }
};

// Auto-save functionality
const autoSave = async () => {
  if (currentDesignId.value) {
    try {
      const designData = flexDesign.serializeDesignData(
        currentDesignName.value,
        currentDesignDescription.value,
        flexModel.value,
      );
      await saveFlexDesign({ ...designData, id: currentDesignId.value });
      console.log("自动保存成功");
    } catch (error) {
      console.error("自动保存失败:", error);
    }
  }
};
const fullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true;
    });
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false;
    });
  }
};
onMounted(() => {
  init();
  document.addEventListener("fullscreenchange", () => {
    isFullscreen.value = !!document.fullscreenElement;
  });

  // 设置自动保存，每5分钟保存一次
  const autoSaveInterval = setInterval(
    () => {
      autoSave();
    },
    5 * 60 * 1000,
  ); // 5分钟

  // 监听页面卸载，自动保存
  window.addEventListener("beforeunload", autoSave);

  // 组件销毁时清理资源
  onUnmounted(() => {
    clearInterval(autoSaveInterval);
    window.removeEventListener("beforeunload", autoSave);
  });
});
watch(
  () => currentId.value,
  (val: string) => {
    // selectItem(val);
    // Reset selected component when current item changes
    // selectedComponentId.value = "";
  },
);
</script>
<template>
  <el-splitter>
    <el-splitter-panel collapsible size="320" max="50%" class="flex flex-col">
      <div class="inner_button">
        <el-select v-model="flexModel" class="" @change="flexChange">
          <el-option value="flex" label="Flex" />
          <el-option value="grid" label="FlexGrid" />
        </el-select>
      </div>
      <el-tabs
        v-model="tabModel"
        class="flex-1"
        tab-position="left"
        @tabChange="tabChange"
        type="border-card"
      >
        <el-tab-pane name="template">
          <template #label>
            <star-horse-icon
              icon-class="template"
              style="color: var(--star-horse-style)"
            />&nbsp;<span>模板</span>
          </template>
          <div class="flex-grid gap-4 w-full flex-wrap">
            <template v-for="item in layoutConfig">
              <div
                class="flex flex-col items-center justify-center"
                @click="layoutOperation(item)"
              >
                <svg-loader
                  :path="'./flexable/' + item.icon"
                  cursor="pointer"
                  size="80px"
                />
                {{ item.name }}
              </div>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane name="comp">
          <template #label>
            <star-horse-icon
              icon-class="list"
              style="color: var(--star-horse-style)"
            />&nbsp;<span>组件</span>
          </template>
          <PageCompPanel />
        </el-tab-pane>
      </el-tabs>
    </el-splitter-panel>
    <el-splitter-panel>
      <div
        class="flex flex-col w-[99%] h-full relative"
        style="margin: 0 auto; background: #86909c"
      >
        <div
          class="flex items-center w-full h-[40px]"
          style="background: #fefefe"
        >
          <el-button-group>
            <el-tooltip
              class="item"
              content="添加元素"
              effect="dark"
              placement="bottom"
            >
              <el-button @click="addItem" class="h-full border-0">
                <star-horse-icon
                  icon-class="add"
                  size="24px"
                  cursor="pointer"
                  style="color: var(--star-horse-style)"
                />
              </el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              content="主轴方向"
              effect="dark"
              placement="bottom"
            >
              <el-button @click="mainAxisDirection" class="h-full border-0">
                <star-horse-icon
                  icon-class="refresh"
                  size="24px"
                  cursor="pointer"
                  style="color: var(--star-horse-style)"
                />
              </el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              content="代码"
              effect="dark"
              placement="bottom"
            >
              <el-button @click="mainAxisDirection" class="h-full border-0">
                <star-horse-icon
                  icon-class="code"
                  size="24px"
                  cursor="pointer"
                />
              </el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              :content="needInfiniteViewer ? '关闭无限滚动' : '开启无限滚动'"
              effect="dark"
              placement="bottom"
            >
              <el-button @click="autoScroll" class="h-full border-0">
                <star-horse-icon
                  :icon-class="needInfiniteViewer ? 'drag' : 'cancel'"
                  size="24px"
                  cursor="pointer"
                />
              </el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              :content="hideRuler ? '开启标尺' : '关闭标尺'"
              effect="dark"
              placement="bottom"
            >
              <el-button @click="hideRulerFunc" class="h-full border-0">
                <star-horse-icon
                  :icon-class="hideRuler ? 'cancel' : 'eye'"
                  size="24px"
                  cursor="pointer"
                />
              </el-button>
            </el-tooltip>
            <el-tooltip content="保存">
              <el-button @click="saveData" class="h-full border-0">
                <star-horse-icon icon-class="save" cursor="pointer" />
              </el-button>
            </el-tooltip>
            <el-tooltip content="预览">
              <el-button @click="preview" class="h-full border-0">
                <star-horse-icon icon-class="preview" cursor="pointer" />
              </el-button>
            </el-tooltip>
            <el-tooltip content="发布">
              <el-button @click="publishPage" class="h-full border-0">
                <star-horse-icon icon-class="publish" cursor="pointer" />
              </el-button>
            </el-tooltip>
            <el-tooltip content="分享">
              <el-button @click="sharePage" class="h-full border-0">
                <star-horse-icon icon-class="share" cursor="pointer" />
              </el-button>
            </el-tooltip>
            <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
              <el-button @click="fullScreen" class="h-full border-0">
                <star-horse-icon
                  :icon-class="
                    isFullscreen ? 'fullscreen-shrink' : 'fullscreen-expand'
                  "
                  cursor="pointer"
                />
              </el-button>
            </el-tooltip>
          </el-button-group>
        </div>
        <StarHorseRuler
          :needInfiniteViewer="needInfiniteViewer"
          :hideHorizontalRuler="hideRuler"
          :hideVerticalRuler="hideRuler"
          ref="rulerRef"
        >
          <div
            :style="containerDataForm"
            class="flex-1"
            @click="selectContainer"
          >
            <template v-for="item in positionList">
              <FlexItem
                :itemId="item"
                @selectItem="selectItem"
                @selectComponent="selectComponent"
                :type="flexModel"
              />
            </template>
          </div>
        </StarHorseRuler>
      </div>
    </el-splitter-panel>
    <el-splitter-panel collapsible size="400" max="40%">
      <el-tabs
        v-model="editTabModel"
        type="border-card"
        style="height: 100% !important"
      >
        <el-tab-pane name="container">
          <template #label>
            <star-horse-icon
              icon-class="container"
              style="color: var(--star-horse-style)"
            />&nbsp;<span>容器</span>
          </template>
          <sh-form
            v-model:dataForm="containerDataForm"
            :label-width="'auto'"
            :label-position="'top'"
          >
            <el-collapse
              v-model="containerCollapse"
              :expand-icon-position="'left'"
              style="background: #1d2129 !important"
            >
              <el-collapse-item name="container">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>布局</div>
                  </div>
                </template>
                <div class="h-full">
                  <StarHorseFormItem
                    :fieldList="containerConfig"
                    v-model:dataForm="containerDataForm"
                  />
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
            <star-horse-icon
              icon-class="list"
              style="color: var(--star-horse-style)"
            />&nbsp;<span>节点</span>
          </template>
          <sh-form
            v-model:dataForm="itemDataForm"
            :label-width="'auto'"
            :label-position="'top'"
          >
            <el-collapse
              v-model="itemCollapse"
              :expand-icon-position="'left'"
              style="background: #1d2129 !important"
            >
              <el-collapse-item name="item">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>布局</div>
                  </div>
                </template>

                <StarHorseFormItem
                  :fieldList="itemConfig"
                  v-model:dataForm="itemDataForm"
                />
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
          </sh-form>
        </el-tab-pane>
        <el-tab-pane key="compPreps" name="compPreps">
          <template #label>
            <star-horse-icon
              icon-class="preps"
              style="color: var(--star-horse-style)"
            />&nbsp;<span>组件属性</span>
          </template>
          <div class="properties-container w-full h-full">
            <PageItemProperties
              :itemId="currentId"
              :componentId="selectedComponentId"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-splitter-panel>
  </el-splitter>

  <!-- Save Dialog -->
  <FlexSaveDialog
    :dialogVisible="saveDialogVisible"
    :designName="currentDesignName"
    :designDescription="currentDesignDescription"
    :designId="currentDesignId"
    :isEdit="!!currentDesignId"
    @closeDialog="saveDialogVisible = false"
    @saved="handleSaved"
  />

  <!-- Preview Dialog -->
  <FlexPreviewDialog
    :dialogVisible="previewDialogVisible"
    :designName="currentDesignName"
    :flexModel="flexModel"
    :containerDataForm="containerDataForm"
    :designDescription="currentDesignDescription"
    @closeDialog="previewDialogVisible = false"
    @saveTemplate="handleSaveTemplate"
  />

  <!-- Share Dialog -->
  <FlexShareDialog
    :dialogVisible="shareDialogVisible"
    :designName="currentDesignName"
    :designDescription="currentDesignDescription"
    @closeDialog="shareDialogVisible = false"
    @shared="handleShared"
  />

  <!-- Publish Dialog -->
  <FlexPublishDialog
    :dialogVisible="publishDialogVisible"
    :designName="currentDesignName"
    :designDescription="currentDesignDescription"
    @closeDialog="publishDialogVisible = false"
    @published="handlePublished"
  />
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
      margin-right: 0 !important;
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
