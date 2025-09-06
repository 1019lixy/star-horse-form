<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useFlexDesignStore} from "@/store/FlexDesign";
import {piniaInstance} from "star-horse-lowcode";
import {componentConfigs, defaultChartOptions} from "@/components/formcomp/pageitems/componentConfig";
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

const jsonEditorVisible = ref(false);
const currentJsonProperty = ref<any>({});
const currentJsonValue = ref("");
const flexDesign = useFlexDesignStore(piniaInstance);
const currentItem = computed(() => {
  const itemList = flexDesign.getComp(props.itemId);
  const item = itemList?.find((temp: any) => temp.id == props.componentId) || {};
  if (!item.preps) {
    item.preps = {
      apiConfig: {}
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
    currentItem.value.preps[field.name] = [];
  }
  jsonEditorVisible.value = true;

};
const saveJsonEditor = () => {
  jsonEditorVisible.value = false;
};
const init = () => {

};
onMounted(() => {
  init();
});
watch(() => currentItem.value.preps.type,
    (newType) => {
      if (currentItem.value.name === "chart" && newType) {
        currentItem.value.preps.option = defaultChartOptions[newType] || defaultChartOptions.line || {};
      }
    },
);
</script>

<template>
  <div class="page-item-properties">
    <div v-if="currentItemPreps" class="properties-content">
      <div class="properties-header">
        <h3>{{ currentItemPreps.label }}</h3>
        <p class="component-type">{{ currentItemPreps.name }}</p>
      </div>
      <div class="properties-form">
        <el-form v-model="currentItem.preps" :rules="{}" ref="formRef" label-width="120px">
          <el-form-item v-for="prop in currentItemPreps.properties" :key="prop.name" :label="prop.label"
                        :prop="prop.name">
            <el-input v-model="currentItem.preps[prop.name]" v-if="prop.type === 'input'"
                      :placeholder="prop.placeholder"/>
            <el-select v-model="currentItem.preps[prop.name]" v-if="prop.type === 'select'" :options="prop.options"/>
            <el-input v-model="currentItem.preps[prop.name]" v-if="prop.type === 'textarea'" type="textarea" :rows="3"/>
            <el-radio-group v-model="currentItem.preps[prop.name]" v-if="prop.type === 'radio'"
                            :options="prop.options"/>
            <el-checkbox-group v-model="currentItem.preps[prop.name]" v-if="prop.type === 'checkbox'"
                               :options="prop.options"/>
            <el-color-picker v-model="currentItem.preps[prop.name]" v-if="prop.type === 'color'"/>
            <!-- JSON Editor for other complex properties -->
            <div v-else-if="prop.type === 'json'" class="json-property">
              <el-button type="primary" plain @click="openJsonEditor(prop)" size="small">
                配置 {{ prop.label }}
              </el-button>
              <p v-if="prop.description" class="property-description">
                {{ prop.description }}
              </p>
              <div class="json-preview" v-if="currentItem.preps[prop.name]">
                <pre>{{
                    JSON.stringify(currentItem.preps[prop.name], null, 2)
                  }}</pre>
              </div>
            </div>

            <!-- API Config Button for API configuration -->
            <div v-else-if="prop.type === 'apiConfig'" class="api-config-property">
              <ApiConfigButton v-model:dataForm="currentItem.preps[prop.name]" :button-text="`配置 ${prop.label}`"
                               :dialog-title="`${currentItemPreps?.label} - ${prop.label}配置`"
              />
              <p v-if="prop.description" class="property-description">
                {{ prop.description }}
              </p>
              <div class="api-config-preview" v-if="
                currentItem.preps[prop.name] &&
                Object.keys(currentItem.preps[prop.name]).length > 0
              ">
                <div class="preview-item">
                  <span class="preview-label">环境:</span>
                  <span class="preview-value">{{
                      currentItem.preps[prop.name].env
                    }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">请求方式:</span>
                  <span class="preview-value">{{
                      currentItem.preps[prop.name].httpMethod
                    }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">URL:</span>
                  <span class="preview-value">{{ currentItem.preps[prop.name].protocol }}://{{
                      currentItem.preps[prop.name].host
                    }}{{
                      currentItem.preps[prop.name].port
                          ? ":" + currentItem.preps[prop.name].port
                          : ""
                    }}{{ currentItem.preps[prop.name].interfaceUrl }}</span>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>暂无属性</p>
    </div>
  </div>
  <star-horse-dialog :dialogVisible="jsonEditorVisible"
                     :title="`${currentItemPreps?.label} - ${currentJsonProperty.label}`"
                     :boxWidth="'50%'" boxHeight="70%" :selfFunc="true" @closeAction="jsonEditorVisible = false"
                     @merge="saveJsonEditor">
    <el-alert title="提示" type="warning" description="请确保输入有效的 JSON 格式" :closable="false" show-icon/>
    <div class="json-editor-container">
      <star-horse-json-editor currentMode="text" v-model="currentItem.preps[currentJsonProperty.name]"/>
    </div>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
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
