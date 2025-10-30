<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useFlexDesignStore} from "@/store/FlexDesign";
import {piniaInstance, useGlobalConfigStore} from "star-horse-lowcode";
import {componentConfigs, defaultChartOptions,} from "@/components/formcomp/pageitems/componentConfig";
import {Config} from "@/api/settings.js";
import {i18n} from "@/lang";
import PagePosition from "@/components/system/items/PagePosition.vue";
import PageFont from "@/components/system/items/PageFont.vue";
import PageBackground from "@/components/system/items/PageBackground.vue";
// Props
const props = defineProps({
  itemId: {
    type: String,
    default: "",
  },
  componentId: {
    type: String,
    default: "",
  },
});
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
    () => configStore.configFormInfo?.inputSize || Config.compSize,
);
const activeTab = ref<string>("preps");
const itemCollapse = ref<string>("basic");
const jsonEditorVisible = ref(false);
const currentJsonProperty = ref<any>({});
const currentJsonValue = ref<any>("");
const flexDesign = useFlexDesignStore(piniaInstance);
const currentItem = computed(() => {
  const itemList = flexDesign.getComp(props.itemId);
  const item =
      itemList?.find((temp: any) => temp.id == props.componentId) || {};
  if (!item.preps) {
    item.preps = {
      apiConfig: {},
    };
  } else if (!item.preps?.apiConfig) {
    item.preps["apiConfig"] = {};
  }
  return item;
});
const currentItemPreps = computed(() => {
  return componentConfigs[currentItem.value.name + "-item"];
});
const openJsonEditor = (field: any) => {
  currentJsonProperty.value = field;
  if (!currentItem.value.preps[field.name]) {
    currentItem.value.preps[field.name] = field.defaultValue ?? [];
  }
  currentJsonValue.value = currentItem.value.preps[field.name];
  jsonEditorVisible.value = true;
};
const saveJsonEditor = () => {
  try {
    currentItem.value.preps[currentJsonProperty.value.name] =
        typeof currentJsonValue.value === "string"
            ? JSON.parse(currentJsonValue.value)
            : currentJsonValue.value;
  } catch (e) {
    console.error("JSON parse error:", e);
  }
  currentJsonValue.value = null;
  jsonEditorVisible.value = false;
};
const init = () => {
};
onMounted(() => {
  init();
});
watch(
    () => currentItem.value.preps.type,
    (newType) => {
      if (currentItem.value.name === "chart" && newType) {
        currentItem.value.preps.option =
            defaultChartOptions[newType] || defaultChartOptions.line || {};
      }
    },
);

// Computed property for z-index with getter and setter
const zIndexValue = computed({
  get: () => {
    return currentItem.value.styles?.zIndex || 1;
  },
  set: (value: number) => {
    if (!currentItem.value.styles) {
      currentItem.value.styles = {};
    }
    currentItem.value.styles.zIndex = value;
  },
});
</script>

<template>
  <div class="page-item-properties">
    <template v-if="currentItemPreps">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane name="preps" label="属性">
          <div class="properties-content">
            <div class="properties-header">
              <h3>{{ currentItemPreps.label }}</h3>
              <p class="component-type">{{ currentItemPreps.name }}</p>
            </div>

            <div class="properties-form">
              <el-form
                  v-model="currentItem.preps"
                  :rules="{}"
                  :size="compSize"
                  ref="formRef"
                  label-width="auto"
                  label-position="top"
              >
                <el-form-item
                    v-for="prop in currentItemPreps.properties"
                    :key="prop.name"
                    :label="prop.label"
                    :prop="prop.name"
                >
                  <el-input
                      v-model="currentItem.preps[prop.name]"
                      v-if="prop.type === 'input'"
                      :placeholder="prop.placeholder"
                  />
                  <el-input-number
                      v-model="currentItem.preps[prop.name]"
                      v-if="prop.type === 'number' && prop.name !== 'zIndex'"
                      :placeholder="prop.placeholder"
                      controls-position="right"
                  />
                  <el-input-number
                      v-model="currentItem.preps[prop.name]"
                      v-if="prop.name === 'zIndex'"
                      controls-position="right"
                      :min="0"
                      :max="9999"
                  />
                  <el-select
                      v-model="currentItem.preps[prop.name]"
                      v-if="prop.type === 'select'"
                      :options="prop.options"
                  />
                  <el-input
                      v-model="currentItem.preps[prop.name]"
                      v-if="prop.type === 'textarea'"
                      type="textarea"
                      :rows="3"
                  />
                  <el-radio-group
                      v-model="currentItem.preps[prop.name]"
                      v-if="prop.type === 'radio'"
                      :options="prop.options"
                  />
                  <el-checkbox-group
                      v-model="currentItem.preps[prop.name]"
                      v-if="prop.type === 'checkbox'"
                      :options="prop.options"
                  />
                  <el-color-picker
                      v-model="currentItem.preps[prop.name]"
                      v-if="prop.type === 'color'"
                  />
                  <!-- JSON Editor for other complex properties -->
                  <div v-else-if="prop.type === 'json'" class="json-property">
                    <el-button
                        type="primary"
                        plain
                        @click="openJsonEditor(prop)"
                        size="small"
                    >
                      {{ i18n("system.flex.pageItemProperties.button.config") }}
                      {{ prop.label }}
                    </el-button>
                    <p v-if="prop.description" class="property-description">
                      {{ prop.description }}
                    </p>
                    <div class="json-preview" v-if="currentItem.preps[prop.name]">
                      <pre>{{ currentItem.preps[prop.name] }}</pre>
                    </div>
                  </div>
                  <div
                      v-else-if="prop.type === 'apiConfig'"
                      class="api-config-property"
                  >
                    <ApiConfigButton
                        v-model:dataForm="currentItem.preps[prop.name]"
                        :button-text="`配置 ${prop.label}`"
                        :dialog-title="`${currentItemPreps?.label} - ${prop.label}配置`"
                    />
                    <p v-if="prop.description" class="property-description">
                      {{ prop.description }}
                    </p>
                    <div
                        class="api-config-preview"
                        v-if="
                  currentItem.preps[prop.name] &&
                  Object.keys(currentItem.preps[prop.name]).length > 0
                "
                    >
                      <div class="preview-item">
                  <span class="preview-label">{{
                      i18n(
                          "system.flex.pageItemProperties.preview.label.environment",
                      )
                    }}</span>
                        <span class="preview-value">{{
                            currentItem.preps[prop.name].env
                          }}</span>
                      </div>
                      <div class="preview-item">
                  <span class="preview-label">{{
                      i18n("system.flex.pageItemProperties.preview.label.method")
                    }}</span>
                        <span class="preview-value">{{
                            currentItem.preps[prop.name].httpMethod
                          }}</span>
                      </div>
                      <div class="preview-item">
                  <span class="preview-label">{{
                      i18n("system.flex.pageItemProperties.preview.label.url")
                    }}</span>
                        <span class="preview-value"
                        >{{ currentItem.preps[prop.name].protocol }}://{{
                            currentItem.preps[prop.name].host
                          }}{{
                            currentItem.preps[prop.name].port
                                ? ":" + currentItem.preps[prop.name].port
                                : ""
                          }}{{ currentItem.preps[prop.name].interfaceUrl }}</span
                        >
                      </div>
                    </div>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane name="styles" label="样式">
          <sh-form
              v-model:dataForm="currentItem.styles"
              :label-width="'auto'"
              :size="compSize"
              :label-position="'top'"
          >
            <el-collapse
                v-model="itemCollapse"
                :expand-icon-position="'left'"
                style="background: #1d2129 !important"
            >
              <el-collapse-item name="basic">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>
                      基础样式
                    </div>
                  </div>
                </template>
                  <el-form-item label="层级" prop="zIndex">
                    <el-input-number
                        v-model="currentItem.styles.zIndex"
                        :size="compSize"
                        clearable
                        controls-position="right"
                        placeholder="请输入层级"
                    />
                  </el-form-item>
                  <el-form-item label="定位" prop="position">
                    <el-select
                        v-model="currentItem.styles.position"
                        :size="compSize"
                        clearable
                        placeholder="请选择定位"
                    />
                  </el-form-item>
              </el-collapse-item>
              <el-collapse-item name="position">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>
                      {{ i18n("system.flex.starHorseFlexComp.item.position") }}
                    </div>
                  </div>
                </template>
                <page-position
                    v-model:dataForm="currentItem.styles"
                    :compSize="compSize"
                />
              </el-collapse-item>
              <el-collapse-item name="background">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>
                      {{
                        i18n("system.flex.starHorseFlexComp.item.background")
                      }}
                    </div>
                  </div>
                </template>
                <page-background
                    v-model:dataForm="currentItem.styles"
                    :compSize="compSize"
                />
              </el-collapse-item>
              <el-collapse-item name="font">
                <template #title>
                  <div class="collapse-item-title title">
                    <div>
                      {{ i18n("system.flex.starHorseFlexComp.item.font") }}
                    </div>
                  </div>
                </template>
                <page-font
                    v-model:dataForm="currentItem.styles"
                    :compSize="compSize"
                />
              </el-collapse-item>
            </el-collapse>
          </sh-form>
        </el-tab-pane>
      </el-tabs>
    </template>
    <div v-else class="empty-state">
      <p>{{ i18n("system.flex.pageItemProperties.emptyState") }}</p>
    </div>
  </div>
  <star-horse-dialog
      :dialogVisible="jsonEditorVisible"
      :title="
      i18n(
        'system.flex.pageItemProperties.dialog.title',
        currentItemPreps?.label,
        currentJsonProperty.label,
      )
    "
      :boxWidth="'50%'"
      boxHeight="70%"
      :selfFunc="true"
      @closeAction="jsonEditorVisible = false"
      @merge="saveJsonEditor"
  >
    <el-alert
        :title="i18n('system.flex.pageItemProperties.alert.title')"
        type="warning"
        :description="i18n('system.flex.pageItemProperties.alert.description')"
        :closable="false"
        show-icon
    />
    <div class="json-editor-container flex-1">
      <star-horse-json-editor currentMode="json" v-model="currentJsonValue"/>
    </div>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
:deep(.el-tabs__content){
  padding:15px 5px;
}
.page-item-properties {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fafafa;
    border-radius: 8px;
  }

  .properties-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .properties-header {
      padding: 16px 20px;
      border-bottom: 1px solid #ebeef5;
      background-color: #f8f9fa;
      border-radius: 8px 8px 0 0;

      h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .component-type {
        margin: 0;
        font-size: 13px;
        color: #909399;
      }
    }

    .properties-form {
      flex: 1;
      overflow-y: auto;
      padding: 20px;

      :deep(.el-form-item) {
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #404040;
        line-height: 1.5;
        padding-bottom: 6px;
      }

      :deep(.el-form-item__content) {
        line-height: normal;
      }

      .chart-options-property,
      .json-property,
      .api-config-property {
        width: 100%;

        .property-description {
          margin: 8px 0 0 0;
          font-size: 12px;
          color: #909399;
        }

        .json-preview {
          margin-top: 12px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #ebeef5;
          overflow: hidden;
          width: 100%;

          pre {
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
            color: #555555;
            white-space: pre-wrap;
            font-family: "Consolas", "Monaco", "Courier New", monospace;
            background-color: #ffffff;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            padding: 12px;
            overflow: auto;
            max-height: 150px;
          }
        }

        .api-config-preview {
          margin-top: 12px;
          padding: 16px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #ebeef5;
          font-size: 13px;

          .preview-item {
            margin-bottom: 10px;
            display: flex;

            &:last-child {
              margin-bottom: 0;
            }

            .preview-label {
              display: inline-block;
              width: 80px;
              color: #909399;
              font-weight: 500;
            }

            .preview-value {
              color: #606266;
              word-break: break-all;
              flex: 1;
            }
          }
        }
      }
    }

    .no-properties {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background-color: #fafafa;
    }
  }

  .json-editor-container {
    margin-top: 16px;

    .json-textarea {
      font-family: "Consolas", "Monaco", "Courier New", monospace;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
