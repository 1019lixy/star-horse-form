<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  type ComponentConfig,
  componentConfigs,
  defaultChartOptions,
} from "@/components/formcomp/pageitems/componentConfig";
import { ApiConfigButton } from "@/components/common";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { piniaInstance } from "star-horse-lowcode";
import { ElMessage } from "element-plus";

// Props
const props = defineProps({
  selectedItemId: {
    type: String,
    default: "",
  },
  // Add this new prop to specify which component to show properties for
  selectedComponentId: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits<{
  (e: "update:property", propertyName: string, value: any): void;
}>();

// Store
const flexDesign = useFlexDesignStore(piniaInstance);

// Reactive data
const propertyForm = ref<Record<string, any>>({});
const jsonEditorVisible = ref(false);
const currentJsonProperty = ref("");
const currentJsonValue = ref("");

// Computed
const selectedItem = computed(() => {
  if (!props.selectedItemId) return null;
  return flexDesign.getItem(props.selectedItemId);
});

const selectedItemCompList = computed(() => {
  if (!props.selectedItemId) return [];
  return flexDesign.getComp(props.selectedItemId) || [];
});

// Add this computed property to find the specific component
const selectedComponent = computed(() => {
  if (!props.selectedItemId || !props.selectedComponentId) return null;
  const compList = flexDesign.getComp(props.selectedItemId) || [];
  if (compList.length === 0) return null;

  // If a specific component is selected, find it by ID
  if (props.selectedComponentId) {
    return (
      compList.find((comp: any) => comp.id === props.selectedComponentId) ||
      compList[0]
    );
  }

  // Otherwise, default to the first component
  return compList[0];
});

const componentType = computed(() => {
  if (!selectedComponent.value) return null;
  const comp = selectedComponent.value;
  return comp?.name ? `${comp.name}-item` : null;
});

const componentConfig = computed<ComponentConfig | null>(() => {
  if (!componentType.value) return null;
  return componentConfigs[componentType.value] || null;
});

const hasProperties = computed(() => {
  return componentConfig.value?.properties.length > 0;
});

// Watch for changes in selected item
watch(
  () => props.selectedItemId,
  () => {
    initializeForm();
  },
);

// Add watcher for selected component
watch(
  () => props.selectedComponentId,
  () => {
    initializeForm();
  },
);

// Watch for changes in component list
watch(
  () => selectedItemCompList.value,
  () => {
    initializeForm();
  },
  { deep: true },
);

// Watch for chart type changes to update default options
watch(
  () => propertyForm.value.type,
  (newType) => {
    if (componentType.value === "chart-item" && newType) {
      // Update the chart options when chart type changes
      const defaultOption =
        defaultChartOptions[newType] || defaultChartOptions.line || {};
      updateProperty("option", defaultOption);
      propertyForm.value.option = defaultOption;
    }
  },
);

// Methods
const initializeForm = () => {
  if (!componentConfig.value) {
    propertyForm.value = {};
    return;
  }

  // Initialize form with default values
  const form: Record<string, any> = {};
  componentConfig.value.properties?.forEach((prop) => {
    // Try to get existing value from component
    const existingValue = getPropertyValue(prop.name);
    form[prop.name] =
      existingValue !== undefined ? existingValue : prop.defaultValue;
  });
  propertyForm.value = form;
};

const getPropertyValue = (propertyName: string): any => {
  if (!selectedComponent.value) return undefined;

  // Get value from the selected component
  const comp = selectedComponent.value;
  if (comp && comp.preps) {
    return comp.preps[propertyName];
  }
  return undefined;
};

const updateProperty = (propertyName: string, value: any) => {
  propertyForm.value[propertyName] = value;
  emit("update:property", propertyName, value);

  // Update the component in the store using the proper store method
  if (props.selectedItemId && selectedComponent.value) {
    // 使用新添加的 updateComponentProperty 方法来更新组件属性
    flexDesign.updateComponentProperty(
      props.selectedItemId,
      selectedComponent.value.id,
      propertyName,
      value,
    );
  }
};

// Handle JSON editor
const openJsonEditor = (propertyName: string) => {
  currentJsonProperty.value = propertyName;
  const value = propertyForm.value[propertyName];
  currentJsonValue.value =
    typeof value === "object" ? JSON.stringify(value, null, 2) : value || "{}";
  jsonEditorVisible.value = true;
};

const saveJsonEditor = () => {
  try {
    const parsedValue = JSON.parse(currentJsonValue.value);
    updateProperty(currentJsonProperty.value, parsedValue);
    jsonEditorVisible.value = false;
    ElMessage.success("配置已保存");
  } catch (error) {
    ElMessage.error("JSON 格式错误: " + (error as Error).message);
  }
};

// Initialize form immediately
initializeForm();
</script>

<template>
  <div class="page-item-properties">
    <div v-if="!componentType" class="empty-state">
      <el-empty description="请选择一个组件查看属性" />
    </div>

    <div v-else-if="!componentConfig" class="empty-state">
      <el-empty description="未找到该组件的配置信息" />
    </div>

    <div v-else class="properties-content">
      <div class="properties-header">
        <h3>{{ componentConfig.label }}属性</h3>
        <p class="component-type">{{ componentType }}</p>
      </div>

      <div v-if="hasProperties" class="properties-form">
        <el-form :model="propertyForm" label-position="top" @submit.prevent>
          <el-form-item
            v-for="prop in componentConfig.properties"
            :key="prop.name"
            :label="prop.label"
            :required="prop.required"
          >
            <!-- Input -->
            <el-input
              v-if="prop.type === 'input'"
              v-model="propertyForm[prop.name]"
              :placeholder="prop.placeholder"
              @change="updateProperty(prop.name, $event)"
            />

            <!-- Number -->
            <el-input-number
              v-else-if="prop.type === 'number'"
              v-model="propertyForm[prop.name]"
              :min="prop.min"
              :max="prop.max"
              :step="prop.step"
              @change="updateProperty(prop.name, $event)"
            />

            <!-- Select -->
            <el-select
              v-else-if="prop.type === 'select'"
              v-model="propertyForm[prop.name]"
              :placeholder="prop.placeholder"
              @change="updateProperty(prop.name, $event)"
            >
              <el-option
                v-for="option in prop.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <!-- Switch -->
            <el-switch
              v-else-if="prop.type === 'switch'"
              v-model="propertyForm[prop.name]"
              @change="updateProperty(prop.name, $event)"
            />

            <!-- Textarea -->
            <el-input
              v-else-if="prop.type === 'textarea'"
              v-model="propertyForm[prop.name]"
              type="textarea"
              :placeholder="prop.placeholder"
              @change="updateProperty(prop.name, $event)"
            />

            <!-- Color -->
            <el-color-picker
              v-else-if="prop.type === 'color'"
              v-model="propertyForm[prop.name]"
              @change="updateProperty(prop.name, $event)"
            />

            <!-- Slider -->
            <el-slider
              v-else-if="prop.type === 'slider'"
              v-model="propertyForm[prop.name]"
              :min="prop.min"
              :max="prop.max"
              :step="prop.step"
              @change="updateProperty(prop.name, $event)"
            />

            <!-- Radio -->
            <el-radio-group
              v-else-if="prop.type === 'radio'"
              v-model="propertyForm[prop.name]"
              @change="updateProperty(prop.name, $event)"
            >
              <el-radio
                v-for="option in prop.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>

            <!-- Checkbox -->
            <el-checkbox-group
              v-else-if="prop.type === 'checkbox'"
              v-model="propertyForm[prop.name]"
              @change="updateProperty(prop.name, $event)"
            >
              <el-checkbox
                v-for="option in prop.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- Date -->
            <el-date-picker
              v-else-if="prop.type === 'date'"
              v-model="propertyForm[prop.name]"
              type="date"
              :placeholder="prop.placeholder"
              @change="updateProperty(prop.name, $event)"
            />

            <!-- Time -->
            <el-time-picker
              v-else-if="prop.type === 'time'"
              v-model="propertyForm[prop.name]"
              :placeholder="prop.placeholder"
              @change="updateProperty(prop.name, $event)"
            />

            <!-- JSON Editor for other complex properties -->
            <div v-else-if="prop.type === 'json'" class="json-property">
              <el-button
                type="primary"
                plain
                @click="openJsonEditor(prop.name)"
                size="small"
              >
                配置 {{ prop.label }}
              </el-button>
              <p v-if="prop.description" class="property-description">
                {{ prop.description }}
              </p>
              <div class="json-preview" v-if="propertyForm[prop.name]">
                <pre
                  >{{
                    JSON.stringify(propertyForm[prop.name], null, 2).substring(
                      0,
                      100,
                    )
                  }}...</pre
                >
              </div>
            </div>

            <!-- API Config Button for API configuration -->
            <div
              v-else-if="prop.type === 'apiConfig'"
              class="api-config-property"
            >
              <ApiConfigButton
                v-model="propertyForm[prop.name]"
                :button-text="`配置 ${prop.label}`"
                :dialog-title="`${componentConfig?.label} - ${prop.label}配置`"
                @save="updateProperty(prop.name, $event)"
              />
              <p v-if="prop.description" class="property-description">
                {{ prop.description }}
              </p>
              <div
                class="api-config-preview"
                v-if="
                  propertyForm[prop.name] &&
                  Object.keys(propertyForm[prop.name]).length > 0
                "
              >
                <div class="preview-item">
                  <span class="preview-label">环境:</span>
                  <span class="preview-value">{{
                    propertyForm[prop.name].env
                  }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">请求方式:</span>
                  <span class="preview-value">{{
                    propertyForm[prop.name].httpMethod
                  }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">URL:</span>
                  <span class="preview-value"
                    >{{ propertyForm[prop.name].protocol }}://{{
                      propertyForm[prop.name].host
                    }}{{
                      propertyForm[prop.name].port
                        ? ":" + propertyForm[prop.name].port
                        : ""
                    }}{{ propertyForm[prop.name].interfaceUrl }}</span
                  >
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div v-else class="no-properties">
        <el-alert
          title="该组件没有可配置的属性"
          type="info"
          :closable="false"
        />
      </div>
    </div>

    <!-- JSON Editor Dialog -->
    <el-dialog
      v-model="jsonEditorVisible"
      :title="`${componentConfig?.label} - ${currentJsonProperty}`"
      width="600px"
    >
      <el-alert
        title="注意"
        type="warning"
        description="请确保输入有效的 JSON 格式"
        :closable="false"
        show-icon
      />
      <div class="json-editor-container">
        <el-input
          v-model="currentJsonValue"
          type="textarea"
          :rows="15"
          placeholder="请输入 JSON 配置"
          class="json-textarea"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="jsonEditorVisible = false">取消</el-button>
          <el-button type="primary" @click="saveJsonEditor">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-item-properties {
  height: 100%;
  display: flex;
  flex-direction: column;

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .properties-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .properties-header {
      padding: 16px;
      border-bottom: 1px solid #ebeef5;

      h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }

      .component-type {
        margin: 0;
        font-size: 12px;
        color: #909399;
      }
    }

    .properties-form {
      flex: 1;
      overflow-y: auto;
      padding: 16px;

      :deep(.el-form-item) {
        margin-bottom: 18px;
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
        line-height: 1.4;
      }

      .chart-options-property,
      .json-property,
      .api-config-property {
        .property-description {
          margin: 8px 0 0 0;
          font-size: 12px;
          color: #909399;
        }

        .json-preview {
          margin-top: 8px;
          padding: 8px;
          background-color: #f5f7fa;
          border-radius: 4px;
          max-height: 100px;
          overflow: hidden;

          pre {
            margin: 0;
            font-size: 12px;
            color: #606266;
            white-space: pre-wrap;
          }
        }

        .api-config-preview {
          margin-top: 8px;
          padding: 12px;
          background-color: #f5f7fa;
          border-radius: 4px;
          font-size: 12px;

          .preview-item {
            margin-bottom: 6px;

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
