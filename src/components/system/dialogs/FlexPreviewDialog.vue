<template>
  <star-horse-dialog
      :dialogVisible="dialogVisible"
      @closeAction="closeDialog"
      :selfFunc="true"
      :boxWidth="'90%'"
      boxHeight="80%"
      :full-screen="false"
      :title="i18n('system.flex.previewDialog.title')"
      :source="3"
  >
    <div class="preview-container">
      <div class="preview-header">
        <div class="preview-info">
          <h3>
            {{ designName || i18n("system.flex.previewDialog.untitled") }}
          </h3>
          <p v-if="designDescription" class="design-description">
            {{ designDescription }}
          </p>
          <div class="design-stats">
            <el-tag size="small" type="info"
            >{{ i18n("system.flex.previewDialog.label.itemCount") }}:
              {{ designSummary.itemCount }}
            </el-tag>
            <el-tag size="small" type="success" style="margin-left: 8px">
              {{ i18n("system.flex.previewDialog.label.compCount") }}:
              {{ designSummary.compCount }}
            </el-tag>
            <el-tag size="small" type="warning" style="margin-left: 8px">
              {{ i18n("system.flex.previewDialog.label.direction") }}:
              {{ designSummary.containerDirection }}
            </el-tag>
          </div>
        </div>
        <div class="preview-actions">
          <el-button-group>
            <el-button type="success" plain @click="toggleDeviceMode">
              <star-horse-icon
                  color="#fff"
                  :icon-class="deviceMode === 'desktop' ? 'mobile' : 'desktop'"
              />
              {{
                deviceMode === "desktop"
                    ? i18n("system.flex.previewDialog.button.mobilePreview")
                    : i18n("system.flex.previewDialog.button.desktopPreview")
              }}
            </el-button>
            <el-button type="info" plain @click="refreshPreview">
              <star-horse-icon icon-class="refresh"/>
              {{ i18n("system.flex.previewDialog.button.refresh") }}
            </el-button>
            <el-button type="info" plain @click="exportHTML">
              <star-horse-icon icon-class="download" color="#fff"/>
              {{ i18n("system.flex.previewDialog.button.exportHTML") }}
            </el-button>
            <el-button
                type="info"
                plain
                @click="showDebugInfo = !showDebugInfo"
            >
              <star-horse-icon icon-class="info" color="#fff"/>
              {{
                showDebugInfo
                    ? i18n("system.flex.previewDialog.button.hideDebug")
                    : i18n("system.flex.previewDialog.button.showDebug")
              }}
            </el-button>
          </el-button-group>
        </div>
      </div>

      <div class="preview-content" :class="deviceModeClass">
        <div class="preview-frame">
          <div class="frame-header" v-if="deviceMode === 'mobile'">
            <div class="frame-controls">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="frame-title">
              {{ i18n("system.flex.previewDialog.title") }}
            </div>
          </div>
          <div class="frame-content" ref="previewContentRef">
            <div :style="containerStyles" class="flex-1">
              <template v-for="item in positionList">
                <FlexItem
                    :itemId="item"
                    :type="flexModel"
                    :previewMode="true"
                />
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Information Panel -->
      <div v-if="showDebugInfo" class="debug-panel">
        <el-divider content-position="center">{{
            i18n("system.flex.previewDialog.title.debugInfo")
          }}
        </el-divider>
        <div class="debug-content">
          <div class="debug-section">
            <h4>{{ i18n("system.flex.previewDialog.label.layoutMode") }}</h4>
            <pre>{{ props.flexModel }}</pre>
          </div>
          <div class="debug-section">
            <h4>
              {{ i18n("system.flex.previewDialog.label.containerStyles") }}
            </h4>
            <pre>{{ containerStyles }}</pre>
          </div>
          <div class="debug-section">
            <h4>{{ i18n("system.flex.previewDialog.label.containerData") }}</h4>
            <pre>{{ JSON.stringify(props.containerDataForm, null, 2) }}</pre>
          </div>
          <div class="debug-section">
            <h4>
              {{ i18n("system.flex.previewDialog.label.containerDirection") }}
            </h4>
            <pre>{{ flexDesign.getContainerDirection() }}</pre>
          </div>
          <div class="debug-section">
            <h4>{{ i18n("system.flex.previewDialog.label.containerInfo") }}</h4>
            <pre>{{
                JSON.stringify(flexDesign.getContainerInfo(), null, 2)
              }}</pre>
          </div>
          <div class="debug-section">
            <h4>{{ i18n("system.flex.previewDialog.label.itemInfo") }}</h4>
            <div
                v-for="position in positionList"
                :key="position"
                class="debug-item"
            >
              <strong>{{ position }}:</strong>
              <pre>{{ getItemStyle(position) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-footer">
        <div
            class="validation-info"
            v-if="validationResult && !validationResult.isValid"
        >
          <el-alert
              :title="i18n('system.flex.previewDialog.title.validationFailed')"
              type="warning"
              :closable="false"
              show-icon
          >
            <ul>
              <li v-for="error in validationResult.errors" :key="error">
                {{ error }}
              </li>
            </ul>
          </el-alert>
        </div>
        <div class="code-preview" v-if="showCode">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>{{
                    i18n("system.flex.previewDialog.title.htmlCode")
                  }}</span>
                <el-button size="small" @click="copyCode">
                  <star-horse-icon icon-class="copy"/>
                  {{ i18n("system.flex.previewDialog.button.copy") }}
                </el-button>
              </div>
            </template>
            <pre><code>{{ htmlCode }}</code></pre>
          </el-card>
        </div>
        <div class="footer-actions">
          <el-button @click="toggleCodeView">
            {{
              showCode
                  ? i18n("system.flex.previewDialog.button.hideCode")
                  : i18n("system.flex.previewDialog.button.showCode")
            }}
          </el-button>
          <el-button type="primary" @click="saveAsTemplate">
            {{ i18n("system.flex.previewDialog.button.saveTemplate") }}
          </el-button>
        </div>
      </div>
    </div>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import {computed, nextTick, ref, watch} from "vue";
import {useFlexDesignStore} from "@/store/FlexDesign";
import {error, piniaInstance, success} from "star-horse-lowcode";
import FlexItem from "@/components/system/items/page/FlexItem.vue";
import {i18n} from "@/lang";

interface Props {
  dialogVisible: boolean;
  designName?: string;
  designDescription?: string;
  flexModel: string;
  containerDataForm?: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  closeDialog: [];
  saveTemplate: [data: any];
}>();

const flexDesign = useFlexDesignStore(piniaInstance);
const previewContentRef = ref<HTMLElement>();
const deviceMode = ref<"desktop" | "mobile">("desktop");
const showCode = ref(false);
const showDebugInfo = ref(false);
const selectedPreviewItem = ref<string>("");

/**
 * 将驼峰命名转换为CSS属性格式
 * @param key 驼峰命名的属性
 * @returns CSS格式的属性名
 */
const camelToKebab = (key: string): string => {
  return key.replace(/([A-Z])/g, "-$1").toLowerCase();
};

const designSummary = computed(() => flexDesign.getDesignSummary());
const validationResult = computed(() => flexDesign.validateDesign());
const htmlCode = computed(() =>
    flexDesign.generatePreviewHTML(props.flexModel, props.containerDataForm),
);
const positionList = computed(() => flexDesign.getPositionList());
const containerStyles = computed(() => {
  const containerInfo = flexDesign.getContainerInfo().containerContent || {};
  //将容器信息转换成样式Css格式的属性
  let style: any = {};
  Object.keys(containerInfo || {}).forEach((key) => {
    style[camelToKebab(key)] = containerInfo[key];
  });
  return style;
});

const deviceModeClass = computed(() => ({
  "preview-desktop": deviceMode.value === "desktop",
  "preview-mobile": deviceMode.value === "mobile",
}));

const getItemStyle = (position: string) => {
  const item = flexDesign.getItem(position);
  const itemStyles = item || {};

  // 添加默认样式确保元素可见
  const defaultStyles = {
    minHeight: "40px",
    padding: "8px",
    backgroundColor: itemStyles.backgroundColor || "#f5f5f5",
    border: "1px solid #ddd",
    margin: "2px",
    ...itemStyles,
  };

  return Object.entries(defaultStyles)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
};


const toggleDeviceMode = () => {
  deviceMode.value = deviceMode.value === "desktop" ? "mobile" : "desktop";
};

const refreshPreview = () => {
  nextTick(() => {
    if (previewContentRef.value) {
      previewContentRef.value.scrollTop = 0;
    }
  });
  success(i18n("system.flex.previewDialog.message.refreshSuccess"));
};

const exportHTML = () => {
  const html = htmlCode.value;
  const blob = new Blob([html], {type: "text/html"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${props.designName || "flex-design"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  success(i18n("system.flex.previewDialog.message.htmlExported"));
};

const toggleCodeView = () => {
  showCode.value = !showCode.value;
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(htmlCode.value);
    success(i18n("system.flex.previewDialog.message.codeCopied"));
  } catch (err) {
    console.error("复制失败:", err);
    error(i18n("system.flex.previewDialog.message.copyFailed"));
  }
};

const saveAsTemplate = () => {
  const designData = flexDesign.serializeDesignData(
      props.designName ||
      i18n("system.flex.previewDialog.message.untitledTemplate"),
      props.designDescription || "",
  );
  emit("saveTemplate", designData);
};

const closeDialog = () => {
  emit("closeDialog");
};

// 监听dialog显示状态，重置数据
watch(
    () => props.dialogVisible,
    (visible) => {
      if (visible) {
        selectedPreviewItem.value = "";
        showCode.value = false;
        showDebugInfo.value = false;
        deviceMode.value = "desktop";
      }
    },
);
</script>

<style lang="scss" scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 5px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;

  .preview-info {
    h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .design-stats {
      display: flex;
      gap: 8px;
    }
  }

  .preview-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

.preview-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  background: #f5f5f5;
  overflow: auto;

  &.preview-mobile {
    .preview-frame {
      max-width: 375px;
      width: 100%;
    }
  }

  &.preview-desktop {
    .preview-frame {
      width: 100%;
    }
  }
}

.preview-frame {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 400px;
  height: 100%;

  .frame-header {
    height: 40px;
    background: #f8f8f8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #e8e8e8;

    .frame-controls {
      display: flex;
      gap: 6px;

      span {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ff5f57;

        &:nth-child(2) {
          background: #ffbd2e;
        }

        &:nth-child(3) {
          background: #28ca42;
        }
      }
    }

    .frame-title {
      font-size: 14px;
      color: #666;
    }
  }

  .frame-content {
    padding: 5px;
    min-height: 300px;
    flex: 1;
    height: 100%;
    display: flex;
    overflow: auto;
  }
}

.preview-container-content {
  /* 保持灵活性，不强制设置任何布局相关属性 */

  /* 由内联样式控制flex属性 */
}

.preview-item {
  border: 2px dashed transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  /* 让元素可以正常参与flex布局 */

  &:hover {
    border-color: #409eff;
    background: rgba(64, 158, 255, 0.05);
  }

  &.active {
    border-color: #67c23a;
    background: rgba(103, 194, 58, 0.05);
  }

  .item-content {
    width: 100%;
    height: 100%;
    min-height: 40px; /* 确保最小高度 */
  }

  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #999;
    background: #f9f9f9;
    border: 1px dashed #ddd;
    border-radius: 4px;
    min-height: 60px;

    span {
      margin-top: 8px;
      font-size: 12px;
    }
  }
}

.preview-footer {
  border-top: 1px solid #e8e8e8;
  background: #fafafa;

  .validation-info {
    padding: 5px;
    border-bottom: 1px solid #e8e8e8;

    ul {
      margin: 8px 0 0 0;
      padding-left: 20px;

      li {
        color: #f56c6c;
        font-size: 12px;
      }
    }
  }

  .code-preview {
    padding: 5px;
    border-bottom: 1px solid #e8e8e8;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    pre {
      max-height: 200px;
      overflow: auto;
      background: #f5f5f5;
      padding: 5px;
      border-radius: 4px;
      margin: 0;

      code {
        font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
        font-size: 12px;
        line-height: 1.4;
      }
    }
  }

  .footer-actions {
    padding: 5px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

.debug-panel {
  background: #f8f9fa;
  border-top: 1px solid #e8e8e8;

  .debug-content {
    padding: 16px;
    max-height: 300px;
    overflow-y: auto;
  }

  .debug-section {
    margin-bottom: 16px;

    h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 14px;
    }

    pre {
      background: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      margin: 0;
      overflow-x: auto;
    }
  }

  .debug-item {
    margin-bottom: 8px;

    strong {
      color: #409eff;
      font-size: 12px;
    }

    pre {
      margin-top: 4px;
    }
  }
}
</style>
