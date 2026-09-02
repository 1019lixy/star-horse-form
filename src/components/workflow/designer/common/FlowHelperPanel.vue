<script setup lang="ts">
import {dlog, dwarn, derror, dinfo} from "@/utils/debugLog";
import { computed, onMounted, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  loadData,
  piniaInstance,
  uuid,
} from "star-horse-lowcode";
import { useFlowDesignStore } from "@/store/FlowDesign";
import { scale } from "@/components/workflow/utils/deviceUtil";

const emit = defineEmits(["close"]);
const props = defineProps({
  mobile: {
    type: Boolean,
    default: false,
  },
});
const flowDesign = useFlowDesignStore(piniaInstance);
const suggestBranchEnable = computed({
  get: () => flowDesign.suggestBranchEnable,
  set: (val: boolean) => flowDesign.$patch({ suggestBranchEnable: val }),
});
const parallelBranchEnable = computed({
  get: () => flowDesign.parallelBranchEnable,
  set: (val: boolean) => flowDesign.$patch({ parallelBranchEnable: val }),
});
const dynamicFlow = ref<boolean>(false);

const templateUrl: ApiUrls = apiInstance("flow-engine", "workflow/flowTemplate");
const activeTab = ref<string>("system");
const systemTemplates = ref<any[]>([]);
const advancedTemplates = ref<any[]>([]);
const customTemplates = ref<any[]>([]);
const loading = ref<boolean>(false);

const tabs = [
  { key: "system", label: "系统模板", icon: "flow_temp_icon" },
  { key: "advanced", label: "高级模板", icon: "advanced_template" },
  { key: "custom", label: "自定义模板", icon: "self_template" },
  { key: "enhance", label: "流程增强", icon: "setting" },
];

const getTemplateList = (key: string) => {
  switch (key) {
    case "system":
      return systemTemplates.value;
    case "advanced":
      return advancedTemplates.value;
    case "custom":
      return customTemplates.value;
    default:
      return [];
  }
};

const loadTemplates = async () => {
  loading.value = true;
  try {
    const res = await loadData(templateUrl.listConditionUrl!, {
      fieldList: [createCondition("enabled", true)],
      orderBy: [{ fieldName: "sortNum", orderBy: "asc" }],
    });
    const data = res.data || [];
    systemTemplates.value = data.filter((t: any) => t.templateCategory === "system");
    advancedTemplates.value = data.filter((t: any) => t.templateCategory === "advanced");
    customTemplates.value = data.filter((t: any) => t.templateCategory === "custom");
  } catch (e) {
    dwarn("加载模板失败", e);
  } finally {
    loading.value = false;
  }
};

const selectTemplate = (template: any) => {
  if (template.processJson) {
    try {
      const processData = JSON.parse(template.processJson);
      flowDesign.setNode(processData);
    } catch (e) {
      dwarn("解析模板流程数据失败", e);
    }
  }
  if (template.flowGroup) {
    flowDesign.formAddField("flowGroup", template.flowGroup);
    flowDesign.formAddField("flowGroupName", template.flowGroupName || "");
  }
  if (template.formId) {
    flowDesign.formAddField("formId", template.formId);
    flowDesign.formAddField("bindFormName", template.formName);
  }
};

const saveAsCustomTemplate = async () => {
  const processJson = JSON.stringify(flowDesign.node);
  const formInfo = flowDesign.flowFormInfo;
  const template = {
    idFlowTemplate: uuid(),
    templateName: formInfo.name ? `${formInfo.name}模板` : "自定义模板",
    templateCode: `custom_${Date.now()}`,
    templateCategory: "custom",
    templateIcon: formInfo.flowIcon || "document",
    templateDesc: `基于"${formInfo.name || "未命名"}"流程创建的自定义模板`,
    flowGroup: formInfo.flowGroup,
    flowGroupName: formInfo.flowGroupName,
    formId: formInfo.formId,
    formName: formInfo.bindFormName,
    processJson,
    settingsJson: "{}",
    enabled: true,
    sortNum: customTemplates.value.length + 1,
  };
  try {
    await templateUrl.mergeAction!(template);
    loadTemplates();
  } catch (e) {
    dwarn("保存自定义模板失败", e);
  }
};

const deleteTemplate = async (template: any) => {
  try {
    await templateUrl.deleteAction!(template.idFlowTemplate);
    loadTemplates();
  } catch (e) {
    dwarn("删除模板失败", e);
  }
};

const panelWidth = computed(() => {
  if (props.mobile) return "100%";
  return scale.isMobile() ? "100%" : "360px";
});

onMounted(() => {
  loadTemplates();
});
</script>

<template>
  <div class="helper-panel" :class="{ 'helper-panel-mobile': mobile }" :style="{ width: panelWidth }">
    <!-- 头部（PC端显示，移动端由抽屉提供标题） -->
    <div v-if="!mobile" class="helper-panel-header">
      <span class="helper-panel-title">模板与配置</span>
      <el-button text size="small" @click="emit('close')">
        <star-horse-icon icon-class="close" size="14px" />
      </el-button>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="helper-panel-tabs">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :label="tab.label"
        :name="tab.key"
      >
        <!-- 模板卡片区域 -->
        <div v-if="tab.key !== 'enhance'" class="helper-panel-content">
          <div v-if="loading" class="helper-panel-loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else class="template-list">
            <div
              v-for="tpl in getTemplateList(tab.key)"
              :key="tpl.idFlowTemplate"
              class="template-card"
              @click="selectTemplate(tpl)"
            >
              <div class="template-card-icon">
                <star-horse-icon
                  :icon-class="tpl.templateIcon || 'document'"
                  size="24px"
                  color="var(--star-horse-style)"
                />
              </div>
              <div class="template-card-body">
                <div class="template-card-name">{{ tpl.templateName }}</div>
                <div class="template-card-desc">
                  {{ tpl.templateDesc || "暂无描述" }}
                </div>
              </div>
              <el-button
                v-if="tab.key === 'custom'"
                class="template-card-action"
                link
                type="danger"
                size="small"
                @click.stop="deleteTemplate(tpl)"
              >
                <star-horse-icon icon-class="delete" size="12px" />
              </el-button>
            </div>
            <div
              v-if="getTemplateList(tab.key).length === 0"
              class="template-empty"
            >
              <star-horse-icon icon-class="document" size="32px" color="#dcdfe6" />
              <span>暂无{{ tab.label }}</span>
            </div>
          </div>
        </div>

        <!-- 流程增强配置 -->
        <div v-else class="helper-panel-content">
          <div class="enhance-section">
            <div class="enhance-section-title">流程能力开关</div>
            <div class="enhance-row">
              <div class="enhance-row-info">
                <span class="enhance-row-label">动态流程</span>
                <span class="enhance-row-desc">支持运行时动态调整流程走向</span>
              </div>
              <el-switch v-model="dynamicFlow" />
            </div>
            <div class="enhance-row">
              <div class="enhance-row-info">
                <span class="enhance-row-label">意见分支</span>
                <span class="enhance-row-desc">审批时可添加意见分支节点</span>
              </div>
              <el-switch v-model="suggestBranchEnable" />
            </div>
            <div class="enhance-row">
              <div class="enhance-row-info">
                <span class="enhance-row-label">并行节点</span>
                <span class="enhance-row-desc">支持添加并行审批节点</span>
              </div>
              <el-switch v-model="parallelBranchEnable" />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 底部操作栏 -->
    <div class="helper-panel-footer">
      <el-button type="primary" plain size="small" @click="saveAsCustomTemplate">
        <star-horse-icon icon-class="save" size="12px" />
        保存为自定义模板
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.helper-panel {
  position: absolute;
  left: 80px;
  top: 16px;
  bottom: 60px;
  z-index: 10;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* 移动端面板：填满抽屉容器 */
.helper-panel-mobile {
  position: relative;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 0;
  box-shadow: none;
  height: 100%;
}
.helper-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f0f0f0;
}
.helper-panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.helper-panel-tabs {
  flex: 1;
  overflow: auto;
  padding: 0 12px;
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  :deep(.el-tabs__item) {
    font-size: 13px;
    height: 38px;
    line-height: 38px;
    padding: 0 10px;
  }
}
.helper-panel-content {
  padding: 8px 4px;
}
.helper-panel-loading {
  padding: 12px;
}
.helper-panel-footer {
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.template-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: var(--star-horse-style);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
}
.template-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(64, 158, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.template-card-body {
  flex: 1;
  min-width: 0;
}
.template-card-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.template-card-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.template-card-action {
  flex-shrink: 0;
}
.template-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 16px;
  color: #c0c4cc;
  font-size: 13px;
}

.enhance-section {
  padding: 4px 0;
}
.enhance-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}
.enhance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
}
.enhance-row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.enhance-row-label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}
.enhance-row-desc {
  font-size: 11px;
  color: #909399;
}
</style>
