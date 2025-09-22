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
import {Layout} from "@/components/types/dataTypes";
import {appInstance} from "@/main";
import {useFlexDesignStore} from "@/store/FlexDesign";
import {flexBoxContainerConfig} from "@/utils/flexbox/containerConfig";
import {flexBoxItemsConfig} from "@/utils/flexbox/itemsConfig";
import {flexboxLayouts} from "@/utils/flexbox/layouts";
import {gridContainerConfig} from "@/utils/grid/containerConfig";
import {gridItemsConfig} from "@/utils/grid/itemsConfig";
import {gridLayouts} from "@/utils/grid/layouts";

import {
  error,
  operationConfirm,
  PageFieldInfo,
  piniaInstance,
  success,
  useGlobalConfigStore,
  uuid,
} from "star-horse-lowcode";
import {computed, defineOptions, onMounted, onUnmounted, ref, watch,} from "vue";
import { i18n } from "@/lang";
import StarHorseRuler from "./StarHorseRuler.vue";
import {useRouter} from "vue-router";
import {Config} from "@/api/settings.js";

defineOptions({
  name: "StarHorseFlexComp",
});
const flexDesign = useFlexDesignStore(piniaInstance);
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
    () => configStore.configFormInfo?.inputSize || Config.compSize,
);
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
const currentDesignName = ref<string>(i18n("system.flex.starHorseFlexComp.design.untitled"));
const currentDesignDescription = ref<string>("");

let index = 0;
const tabChange = (val: string) => {
};
const addItem = () => {
  let itemId = uuid();
  flexDesign.addItem(itemId, {});
  selectItem(itemId);
};
/**
 * Main axis direction
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
    label: i18n("system.flex.starHorseFlexComp.inputBox"),
    formVisible: true,
    fieldName: "name",
    itemType: "item",
  });
};
/**
 * Initialize
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
let router = useRouter();
const returnRouter = () => {
  router.push({
    path: "/",
  });
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
  // Validate design data
  const validation = flexDesign.validateDesign();
  if (!validation.isValid) {
    error(i18n("system.flex.starHorseFlexComp.validationFailed"));
    console.warn(i18n("system.flex.starHorseFlexComp.validationError"), validation.errors);
    return;
  }
  previewDialogVisible.value = true;
};

const publishPage = () => {
  // Validate design data
  const validation = flexDesign.validateDesign();
  if (!validation.isValid) {
    error(i18n("system.flex.starHorseFlexComp.publishValidationFailed"));
    console.warn(i18n("system.flex.starHorseFlexComp.validationError"), validation.errors);
    return;
  }
  publishDialogVisible.value = true;
};

const sharePage = () => {
  // Validate design data
  const validation = flexDesign.validateDesign();
  if (!validation.isValid) {
    error(i18n("system.flex.starHorseFlexComp.shareValidationFailed"));
    console.warn(i18n("system.flex.starHorseFlexComp.validationError"), validation.errors);
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
  success(i18n("system.flex.starHorseFlexComp.saveSuccess"));
};

const handleShared = (result: ShareResult) => {
  shareDialogVisible.value = false;
  success(i18n("system.flex.starHorseFlexComp.shareSuccess"));
  console.log(i18n("system.flex.starHorseFlexComp.shareResult"), result);
};

const handlePublished = (result: PublishResult) => {
  publishDialogVisible.value = false;
  success(i18n("system.flex.starHorseFlexComp.publishSuccess"));
  console.log(i18n("system.flex.starHorseFlexComp.publishResult"), result);
};

const handleSaveTemplate = (templateData: any) => {
  console.log(i18n("system.flex.starHorseFlexComp.saveTemplate"), templateData);
  success(i18n("system.flex.starHorseFlexComp.templateSaveSuccess"));
  previewDialogVisible.value = false;
};
const emptyStage = () => {
  operationConfirm(i18n("system.flex.starHorseFlexComp.confirmClearStage")).then((b: boolean) => {
    if (b) {
      flexDesign.clearAll();
    }
  });
};
// Load design data
const loadDesign = async (designId: string) => {
  try {
    const designData = await loadFlexDesign(designId);
    flexDesign.loadDesignData(designData);
    currentDesignId.value = designData.id || "";
    currentDesignName.value = designData.name;
    currentDesignDescription.value = designData.description || "";
    success(i18n("system.flex.starHorseFlexComp.loadSuccess"));
  } catch (err) {
    console.error(i18n("system.flex.starHorseFlexComp.loadError"), err);
    error(i18n("system.flex.starHorseFlexComp.loadFailed"));
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
      await saveFlexDesign({...designData, id: currentDesignId.value});
      console.log(i18n("system.flex.starHorseFlexComp.autoSaveSuccess"));
    } catch (error) {
      console.error(i18n("system.flex.starHorseFlexComp.autoSaveFailed"), error);
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

  // Set up auto save, save every 5 minutes
  const autoSaveInterval = setInterval(
      () => {
        autoSave();
      },
      5 * 60 * 1000,
  ); // 5 minutes

  // Listen for page unload, auto save
  window.addEventListener("beforeunload", autoSave);

  // Clean up resources when component is destroyed
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
      <el-tabs
          v-model="tabModel"
          class="flex-1"
          tab-position="left"
          @tabChange="tabChange"
          type="border-card"
      >
        <el-tab-pane name="template" class="flex flex-col">
          <template #label>
            <star-horse-icon
                icon-class="template"
                style="color: var(--star-horse-style)"
            />&nbsp;<span>{{ i18n('system.flex.starHorseFlexComp.tab.template') }}</span>
          </template>
          <div class=" mt-1 mb-3 mx-1 py-5 border-b border-solid border-[#e4e7ed]">
            <el-radio-group v-model="flexModel" @change="flexChange" fill="var(--star-horse-style)">
              <el-radio-button label="Flex" value="flex" />
              <el-radio-button label="Flex Grid" value="grid" />
            </el-radio-group>
          </div>
          <div class="flex-grid gap-4 w-full flex-wrap overflow-y-auto mx-3 ">
            <template v-for="item in layoutConfig">
              <div
                  class="flex flex-col items-center justify-center layout-item mt-2"
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
            />&nbsp;<span>{{ i18n('system.flex.starHorseFlexComp.tab.component') }}</span>
          </template>
          <PageCompPanel/>
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
                :content="i18n('system.flex.starHorseFlexComp.tooltip.return')"
                effect="dark"
                placement="bottom"
            >
              <el-button @click="returnRouter" class="h-full border-0">
                <star-horse-icon
                    icon-class="return"
                    size="24px"
                    cursor="pointer"
                    style="color: var(--star-horse-style)"
                />
              </el-button>
            </el-tooltip>
            <el-tooltip
                class="item"
                :content="i18n('system.flex.starHorseFlexComp.tooltip.addElement')"
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
                :content="i18n('system.flex.starHorseFlexComp.tooltip.clearStage')"
                effect="dark"
                placement="bottom"
            >
              <el-button @click="emptyStage" class="h-full border-0">
                <star-horse-icon
                    icon-class="empty_setting"
                    size="24px"
                    cursor="pointer"
                    style="color: var(--star-horse-style)"
                />
              </el-button>
            </el-tooltip>
            <el-tooltip
                class="item"
                :content="i18n('system.flex.starHorseFlexComp.tooltip.mainAxisDirection')"
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
                :content="i18n('system.flex.starHorseFlexComp.tooltip.code')"
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
                :content="needInfiniteViewer ? i18n('system.flex.starHorseFlexComp.tooltip.infiniteScrollOn') : i18n('system.flex.starHorseFlexComp.tooltip.infiniteScrollOff')"
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
                :content="hideRuler ? i18n('system.flex.starHorseFlexComp.tooltip.rulerOn') : i18n('system.flex.starHorseFlexComp.tooltip.rulerOff')"
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
            <el-tooltip :content="i18n('system.flex.starHorseFlexComp.tooltip.save')">
              <el-button @click="saveData" class="h-full border-0">
                <star-horse-icon icon-class="save" cursor="pointer"/>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="i18n('system.flex.starHorseFlexComp.tooltip.preview')">
              <el-button @click="preview" class="h-full border-0">
                <star-horse-icon icon-class="preview" cursor="pointer"/>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="i18n('system.flex.starHorseFlexComp.tooltip.publish')">
              <el-button @click="publishPage" class="h-full border-0">
                <star-horse-icon icon-class="publish" cursor="pointer"/>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="i18n('system.flex.starHorseFlexComp.tooltip.share')">
              <el-button @click="sharePage" class="h-full border-0">
                <star-horse-icon icon-class="share" cursor="pointer"/>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="isFullscreen ? i18n('system.flex.starHorseFlexComp.tooltip.fullscreenOn') : i18n('system.flex.starHorseFlexComp.tooltip.fullscreenOff')">
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
              class="flex-1 flex-shrink-0"
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
            />&nbsp;<span>{{ i18n('system.flex.starHorseFlexComp.tab.container') }}</span>
          </template>
          <sh-form
              v-model:dataForm="containerDataForm"
              :label-width="'auto'"
              :size="compSize"
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
                    <div>{{ i18n('system.flex.starHorseFlexComp.container.layout') }}</div>
                  </div>
                </template>
                <div class="h-full">
                  <StarHorseFormItem
                      :fieldList="containerConfig"
                      :compSize="compSize"
                      v-model:dataForm="containerDataForm"
                  />
                </div>
              </el-collapse-item>
              <el-collapse-item name="position">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>{{ i18n('system.flex.starHorseFlexComp.container.position') }}</div>
                  </div>
                </template>
                <page-position v-model:dataForm="containerDataForm" :compSize="compSize"/>
              </el-collapse-item>
              <el-collapse-item name="background">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>{{ i18n('system.flex.starHorseFlexComp.container.background') }}</div>
                  </div>
                </template>
                <page-background v-model:dataForm="containerDataForm" :compSize="compSize"/>
              </el-collapse-item>
              <el-collapse-item name="font">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>{{ i18n('system.flex.starHorseFlexComp.container.font') }}</div>
                  </div>
                </template>
                <page-font v-model:dataForm="containerDataForm" :compSize="compSize"/>
              </el-collapse-item>
            </el-collapse>
          </sh-form>
        </el-tab-pane>
        <el-tab-pane name="item">
          <template #label>
            <star-horse-icon
                icon-class="list"
                style="color: var(--star-horse-style)"
            />&nbsp;<span>{{ i18n('system.flex.starHorseFlexComp.tab.item') }}</span>
          </template>
          <sh-form
              v-model:dataForm="itemDataForm"
              :label-width="'auto'"
              :size="compSize"
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
                    <div>{{ i18n('system.flex.starHorseFlexComp.item.layout') }}</div>
                  </div>
                </template>

                <StarHorseFormItem
                    :fieldList="itemConfig"
                    :compSize="compSize"
                    v-model:dataForm="itemDataForm"
                />
              </el-collapse-item>
              <el-collapse-item name="position">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>{{ i18n('system.flex.starHorseFlexComp.item.position') }}</div>
                  </div>
                </template>
                <page-position v-model:dataForm="itemDataForm" :compSize="compSize"/>
              </el-collapse-item>
              <el-collapse-item name="background">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>{{ i18n('system.flex.starHorseFlexComp.item.background') }}</div>
                  </div>
                </template>
                <page-background v-model:dataForm="itemDataForm" :compSize="compSize"/>
              </el-collapse-item>
              <el-collapse-item name="font">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>{{ i18n('system.flex.starHorseFlexComp.item.font') }}</div>
                  </div>
                </template>
                <page-font v-model:dataForm="itemDataForm" :compSize="compSize"/>
              </el-collapse-item>
            </el-collapse>
          </sh-form>
        </el-tab-pane>
        <el-tab-pane key="compPreps" name="compPreps">
          <template #label>
            <star-horse-icon
                icon-class="preps"
                style="color: var(--star-horse-style)"
            />&nbsp;<span>{{ i18n('system.flex.starHorseFlexComp.tab.componentProperties') }}</span>
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
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px; /* Gap uniformly set to 8px */
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

/* Layout item styling with interactive effects */
.layout-item {
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;

  /* Add a subtle inner glow effect */
  &::after {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px solid rgba(64, 158, 255, 0.1);
    border-radius: 10px;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: #409eff;
    box-shadow: 0 12px 24px rgba(64, 158, 255, 0.2);
    background: linear-gradient(145deg, #ffffff, #f0f8ff);

    &::after {
      border-color: rgba(64, 158, 255, 0.3);
    }

    /* Enhance the SVG loader on hover */
    :deep(.svg-loader) {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 20px rgba(64, 158, 255, 0.25);
  }

  /* Style for the component label text */
  &:deep(span) {
    font-size: 12px;
    font-weight: 500;
    color: #606266;
    text-align: center;
    line-height: 1.3;
    margin-top: 8px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Ensure SVG loader maintains its size */
  :deep(.svg-loader) {
    transition: transform 0.3s ease;
    width: 80px !important;
    height: 80px !important;
  }
}
</style>
