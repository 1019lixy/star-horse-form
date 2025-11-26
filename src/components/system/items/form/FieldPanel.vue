<script setup lang="ts" name="FieldPanel">
import { computed, PropType, ref } from "vue";
import {
  loadData,
  piniaInstance,
  useDesignFormStore,
} from "star-horse-lowcode";
import { fieldCopy } from "@/components/system/items/utils/FieldOperationUtils.js";
import { i18n } from "@/lang/index.js";
import { FormConfig } from "@/components/types";

const props = defineProps({
  optional: { type: Object as PropType<FormConfig> },
});
const emits = defineEmits(["loadData"]);
let designForm = useDesignFormStore(piniaInstance);
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let list = computed(() => designForm.compList);
let tabModel = ref<string>("component");
let activeNames = ref(["a", "b", "c", "d"]);
const model = computed(() => props.optional?.model ?? "simple");
const onContainerCopy = (data: any) => {
  return onDataCopy(data, "container");
};
const onFormItemCopy = (data: any) => {
  return onDataCopy(data, "formItem");
};
const onDataCopy = (data: any, type: string) => {
  let mvData = fieldCopy(data, type);
  designForm.setDraggingItem(mvData);
  return mvData;
};
const templateList = ref<any[]>([]);
const tabChange = (name: string) => {
  if (name == "template" && props.optional?.api.basePrefix) {
    loadData(props.optional.api.basePrefix + "/loadTemplate", {}).then(
      async (res: any) => {
        templateList.value = res.data || [];
      },
    );
  }
};
const loadFormData = (formId: any) => {
  emits("loadData", formId);
};

const previewRefs = ref<any[]>([]); // 新增ref数组
// 新增：生成所有预览图片的方法
const createRef = (el: any) => {
  previewRefs.value.push(el);
};
const addElement = (element: any, type: string) => {
  let mvData = fieldCopy(element, type);
  list.value.push(mvData);
  if (Array.isArray(mvData)) {
    let temp = mvData[mvData.length - 1];
    designForm.selectItem(temp, temp["itemType"], "");
  } else {
    designForm.selectItem(mvData, mvData["itemType"], "");
  }
};
defineExpose({});
</script>
<template>
  <el-tabs
    v-model="tabModel"
    class="h-full w-full"
    tab-position="left"
    @tabChange="tabChange"
    type="border-card"
  >
    <el-tab-pane name="component">
      <template #label>
        <star-horse-icon
          icon-class="component"
          style="color: var(--star-horse-style)"
        />&nbsp;<span>{{ i18n("dyform.tab.component") }}</span>
      </template>
      <div class="field-area">
        <el-scrollbar height="100%">
          <el-collapse class="starhorse-collapse" v-model="activeNames">
            <el-collapse-item name="a">
              <template #title>
                <div
                  class="collapse-item-title title h-full flex justify-between"
                >
                  <div class="flex flex-row items-center h-full">
                    {{ i18n("dyform.collapse.layout") }}
                  </div>
                  <star-horse-icon
                    icon-class="container"
                    size="20px"
                    style="color: var(--star-horse-style); margin-right: 10px"
                  />
                </div>
              </template>
              <draggable
                :clone="onContainerCopy"
                :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="id"
                tag="ul"
                :list="containerList"
              >
                <template #item="{ element }">
                  <li
                    class="field-item h-[80px]!"
                    @dblclick="addElement(element, 'container')"
                    :title="element.itemName"
                  >
                    <star-horse-icon
                      :icon-class="element.itemIcon"
                      size="32px"
                      style="color: var(--star-horse-style)"
                    />
                    <i>{{ element.itemName }}</i>
                  </li>
                </template>
              </draggable>
            </el-collapse-item>
            <el-collapse-item name="b">
              <template #title>
                <div
                  class="collapse-item-title title h-full flex justify-between"
                >
                  <div class="flex flex-row items-center h-full">
                    {{ i18n("dyform.collapse.form") }}
                  </div>
                  &nbsp;<star-horse-icon
                    icon-class="form"
                    size="20px"
                    style="color: var(--star-horse-style); margin-right: 10px"
                  />
                </div>
              </template>
              <draggable
                :clone="onFormItemCopy"
                :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="key"
                tag="ul"
                :list="formDataList"
              >
                <template #item="{ element }">
                  <li
                    class="field-item h-[80px]!"
                    @dblclick="addElement(element, 'item')"
                    :title="element.itemName"
                  >
                    <star-horse-icon
                      :icon-class="element.itemIcon"
                      size="32px"
                      style="color: var(--star-horse-style)"
                    />
                    <i>{{ element.itemName }}</i>
                  </li>
                </template>
              </draggable>
            </el-collapse-item>
            <el-collapse-item name="c">
              <template #title>
                <div
                  class="collapse-item-title title h-full flex justify-between"
                >
                  <div class="flex flex-row items-center h-full">
                    {{ i18n("dyform.collapse.custom") }}
                  </div>
                  &nbsp;<star-horse-icon
                    icon-class="other"
                    size="24px"
                    style="color: var(--star-horse-style); margin-right: 10px"
                  />
                </div>
              </template>
              <draggable
                :clone="onFormItemCopy"
                :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="key"
                tag="ul"
                :list="selfFormDataList"
              >
                <template #item="{ element }">
                  <li
                    class="field-item h-[80px]!"
                    @dblclick="addElement(element, 'item')"
                    :title="element.itemName"
                  >
                    <star-horse-icon
                      :icon-class="element.itemIcon"
                      size="32px"
                      style="color: var(--star-horse-style)"
                    />
                    <i>{{ element.itemName }}</i>
                  </li>
                </template>
              </draggable>
              <div style="height: 50px"></div>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </div>
    </el-tab-pane>
    <el-tab-pane name="dbinfo" v-if="model == 'full'">
      <template #label>
        <div class="flex flex-row items-center h-[110px]">
          <star-horse-icon
            icon-class="database"
            style="color: var(--star-horse-style)"
          />&nbsp;<span>{{ i18n("dyform.tab.dbinfo") }}</span>
        </div>
      </template>
      <db-list-comp :optional="optional" />
    </el-tab-pane>
    <el-tab-pane name="template" v-if="model == 'full'">
      <template #label>
        <star-horse-icon
          icon-class="template"
          style="color: var(--star-horse-style)"
        />&nbsp;<span>{{ i18n("dyform.tab.template") }}</span>
      </template>
      <div class="field-area m-t-8">
        <el-empty v-if="!templateList || templateList?.length == 0" />
        <el-scrollbar height="100%">
          <el-card
            class="temp-card"
            style="margin-bottom: 10px !important"
            v-for="item in templateList"
          >
            <div class="flex w-full flex-1 justify-center items-center">
              <el-popover placement="right" :width="500">
                <template #reference>
                  <el-image :src="item.shortImages">
                    <template #error>
                      <star-horse-icon iconClass="empty_image" size="100px" />
                    </template>
                  </el-image>
                </template>
                <template #default>
                  <form-preview
                    :compSize="'small'"
                    :formDisabled="true"
                    :list="JSON.parse(item['details'].content || [])"
                    :ref="createRef"
                    class="flex w-full flex-1 justify-center items-center"
                    v-if="item['details'].content"
                  />
                </template>
              </el-popover>
            </div>
            <template #footer>
              <div class="flex items-center">
                <div
                  class="w-[60%] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  #{{ item.formName }}
                </div>
                <div class="flex-1 justify-end">
                  <el-button
                    size="small"
                    link
                    @click="loadFormData(item.idDynamicForm)"
                    icon="plus"
                    >{{ i18n("dyform.template.load") }}
                  </el-button>
                </div>
              </div>
            </template>
          </el-card>
        </el-scrollbar>
      </div>
    </el-tab-pane>
    <el-tab-pane name="help">
      <template #label>
        <star-horse-icon
          icon-class="help"
          style="color: var(--star-horse-style)"
        />&nbsp;<span>{{ i18n("dyform.tab.help") }}</span>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>
<style lang="scss" scoped>
i {
  font-style: normal;
  font-size: 12px;
}

.temp-card {
  width: 99% !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 250px !important;
  box-shadow: none !important;
  margin-bottom: 10px !important;
}

// Enhanced styling for the collapse component with grid layout
:deep(.starhorse-collapse) {
  border: none;
  background: transparent;

  .el-collapse-item {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      transform: translateY(-3px);
    }

    .el-collapse-item__header {
      background: linear-gradient(120deg, #f0f2f5, #ffffff);
      border-bottom: 1px solid #e4e7ed;
      height: 56px;
      padding: 0 20px;
      font-weight: 600;
      color: #303133;
      font-size: 16px;

      .collapse-item-title {
        letter-spacing: 0.5px;

        .star-horse-icon {
          transition: transform 0.4s ease;
          font-size: 20px;
        }
      }

      &.is-active {
        .star-horse-icon {
          transform: rotate(180deg);
        }
      }
    }

    .el-collapse-item__wrap {
      background: #ffffff;
      border-radius: 0 0 12px 12px;

      .el-collapse-item__content {
        padding: 20px;
      }
    }
  }
}

.field-area {
  .el-scrollbar__view {
    padding: 8px;
  }
}

:deep(.el-collapse-item__content) {
  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 5px;
    padding: 0;
    margin: 0;

    li {
      height: 80px; // As per Component Display and Usability Optimization Standards
      padding: 14px;
      border-radius: 8px;
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      border: 2px solid #e4e7ed;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start; // Align content to top
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;

      // Add a subtle inner glow effect
      &::after {
        content: "";
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        border: 1px solid rgba(64, 158, 255, 0.1);
        border-radius: 14px;
        pointer-events: none;
      }

      &:hover {
        background: linear-gradient(145deg, #ffffff, #eef5ff);
        border-color: #a0cfff;
        transform: translateY(-6px) scale(1.02);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);

        .star-horse-icon {
          transform: scale(1.25) rotate(10deg);
          color: #409eff;
          text-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
        }

        i {
          color: #303133;
          transform: translateY(-3px);
          font-weight: 400;
        }
      }

      i {
        color: #606266;
        font-weight: 500;
        transition: all 0.3s ease;
        text-align: center;
        line-height: 1.4;
        margin-top: auto; // Push text to bottom
      }
    }
  }
}

:deep(.el-collapse-item) {
  overflow: hidden;

  .el-collapse-item__wrap {
    height: 100%;
    overflow: hidden;

    .el-collapse-item__content {
      height: inherit;
      overflow: hidden;
    }
  }

  &:last-child {
    flex: 1;
    height: 100%;
  }
}

:deep {
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
}

.field-item {
  width: 100% !important;
}
</style>
