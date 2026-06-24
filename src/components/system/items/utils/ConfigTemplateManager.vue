<script setup lang="ts">
import {i18n} from "@/lang";
import {error, success, warning} from "star-horse-lowcode";
import {computed, ref, watch} from "vue";
import type {
  ConfigTemplate,
  ConfigTemplateCategory,
  ConfigTemplateCategoryOption,
  ConfigTemplateStorage,
  SaveTemplateParams
} from "@/components/types/DataSourceTypes";
import {getTemplateList, init, removeTemplate, saveTemplate} from "@/api/config_template_api";
import {FormConfig} from "@/components/types";

defineOptions({name: "ConfigTemplateManager"});

const props = defineProps<{
  /** 模板分类 */
  category: ConfigTemplateCategory;
  /** 当前配置数据（用于保存） */
  currentConfigData?: Record<string, any>;
  optional: FormConfig;
}>();

const emit = defineEmits<{
  (e: "load", configData: Record<string, any>): void;
}>();

// ─── 分类选项 ───
const categoryOptions: ConfigTemplateCategoryOption[] = [
  {
    value: "staticData",
    label: i18n("dyform.template.category.staticData"),
    icon: "Document",
    desc: i18n("dyform.template.category.staticData.desc")
  },
  {
    value: "thirdPartyDataSource",
    label: i18n("dyform.template.category.thirdPartyDataSource"),
    icon: "Connection",
    desc: i18n("dyform.template.category.thirdPartyDataSource.desc")
  },
  {
    value: "apiLinkage",
    label: i18n("dyform.template.category.apiLinkage"),
    icon: "Link",
    desc: i18n("dyform.template.category.apiLinkage.desc")
  },
];

// ─── 保存模板弹窗 ───
const saveDialogVisible = ref(false);
const saveForm = ref<{
  name: string;
  storage: ConfigTemplateStorage;
  description: string;
}>({
  name: "",
  storage: "database",
  description: "",
});
const saveLoading = ref(false);

const openSaveDialog = () => {
  saveForm.value = {
    name: "",
    storage: "database",
    description: "",
  };
  saveDialogVisible.value = true;
};

const handleSave = async () => {
  if (!saveForm.value.name?.trim()) {
    warning(i18n("dyform.template.name.required"));
    return;
  }
  if (!props.currentConfigData || Object.keys(props.currentConfigData).length === 0) {
    warning(i18n("dyform.template.save.failed"));
    return;
  }
  saveLoading.value = true;
  try {
    const params: SaveTemplateParams = {
      name: saveForm.value.name.trim(),
      category: props.category,
      description: saveForm.value.description?.trim() || "",
      storage: saveForm.value.storage,
      configData: props.currentConfigData,
    };
    const result = await saveTemplate(params);
    if (result) {
      saveDialogVisible.value = false;
    }
  } catch (_) {
    error(i18n("dyform.template.save.failed"));
  } finally {
    saveLoading.value = false;
  }
};

const closeSaveDialog = () => {
  saveDialogVisible.value = false;
};

// ─── 加载模板弹窗 ───
const loadDialogVisible = ref(false);
const templateList = ref<ConfigTemplate[]>([]);
const loadLoading = ref(false);
const selectedTemplateId = ref<string>("");
const previewVisible = ref(false);
const previewData = ref<any>(null);

const selectedTemplate = computed(() => {
  return templateList.value.find(t => t.id === selectedTemplateId.value);
});

const openLoadDialog = async () => {

  loadDialogVisible.value = true;
  selectedTemplateId.value = "";
  previewData.value = null;
  await loadTemplateList();
};

const loadTemplateList = async () => {
  loadLoading.value = true;
  try {
    templateList.value = await getTemplateList(props.category);
  } catch (_) {
    templateList.value = [];
  } finally {
    loadLoading.value = false;
  }
};

const handlePreview = (template: ConfigTemplate) => {
  previewData.value = template.configData;
  previewVisible.value = true;
};

const handleLoad = () => {
  const template = selectedTemplate.value;
  if (!template) {
    warning(i18n("dyform.template.load.failed"));
    return;
  }
  emit("load", template.configData);
  success(i18n("dyform.template.load.success"));
  loadDialogVisible.value = false;
};

const handleDelete = async (template: ConfigTemplate) => {
  try {
    await removeTemplate(template);
    success(i18n("dyform.template.delete.success"));
    await loadTemplateList();
  } catch (_) {
    error(i18n("dyform.template.delete.failed"));
  }
};

const closeLoadDialog = () => {
  loadDialogVisible.value = false;
};

const closePreviewDialog = () => {
  previewVisible.value = false;
};

const getCategoryLabel = (category: string) => {
  const opt = categoryOptions.find(o => o.value === category);
  return opt?.label || category;
};

const getStorageLabel = (storage: string) => {
  if (storage === "local") return i18n("dyform.template.storage.local");
  return i18n("dyform.template.storage.database");
};
watch(() => props.optional?.configTemplateApi, (val) => {
  if (val) {
    init(val);
  }
}, {
  immediate: true,
});
defineExpose({openSaveDialog, openLoadDialog});
</script>

<template>
  <!-- 保存为模板弹窗 -->
  <star-horse-dialog
      :dialogVisible="saveDialogVisible"
      :title="i18n('dyform.template.save')"
      :selfFunc="true"
      @merge="handleSave"
      @closeAction="closeSaveDialog"
      boxWidth="30%"
  >
    <el-form label-position="top">
      <el-form-item :label="i18n('dyform.template.name')" required>
        <el-input
            v-model="saveForm.name"
            :placeholder="i18n('dyform.template.name.placeholder')"
            maxlength="50"
            show-word-limit
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.template.category')">
        <el-tag type="info">{{ getCategoryLabel(category) }}</el-tag>
      </el-form-item>
      <el-form-item :label="i18n('dyform.template.description')">
        <el-input
            v-model="saveForm.description"
            :placeholder="i18n('dyform.template.description.placeholder')"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.template.storage')" required>
        <el-radio-group v-model="saveForm.storage">
          <el-radio value="database">
            <span>{{ i18n('dyform.template.storage.database') }}</span>
            <span class="storage-desc">{{ i18n('dyform.template.storage.database.desc') }}</span>
          </el-radio>
          <el-radio value="local">
            <span>{{ i18n('dyform.template.storage.local') }}</span>
            <span class="storage-desc">{{ i18n('dyform.template.storage.local.desc') }}</span>
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </star-horse-dialog>

  <!-- 从模板加载弹窗 -->
  <star-horse-dialog
      :dialogVisible="loadDialogVisible"
      :title="i18n('dyform.template.load')"
      :selfFunc="true"
      @merge="handleLoad"
      @closeAction="closeLoadDialog"
      boxWidth="40%"
  >
    <div v-loading="loadLoading" class="template-list">
      <el-empty v-if="templateList.length === 0 && !loadLoading" :description="i18n('dyform.template.empty')"/>
      <div
          v-for="template in templateList"
          :key="template.id"
          :class="['template-item', { active: selectedTemplateId === template.id }]"
          @click="selectedTemplateId = template.id"
      >
        <div class="template-info">
          <div class="template-name">
            <el-icon v-if="selectedTemplateId === template.id" color="var(--el-color-primary)">
              <CircleCheckFilled/>
            </el-icon>
            {{ template.name }}
          </div>
          <div class="template-meta">
            <el-tag size="small" type="info">{{ getCategoryLabel(template.category) }}</el-tag>
            <el-tag size="small" :type="template.storage === 'database' ? 'success' : 'warning'">
              {{ getStorageLabel(template.storage) }}
            </el-tag>
            <span v-if="template.description" class="template-desc">{{ template.description }}</span>
          </div>
        </div>
        <div class="template-actions">
          <el-button size="small" link type="primary" @click.stop="handlePreview(template)">
            {{ i18n('dyform.template.preview') }}
          </el-button>
          <el-button size="small" link type="danger" @click.stop="handleDelete(template)">
            删除
          </el-button>
        </div>
      </div>
    </div>
  </star-horse-dialog>

  <!-- 预览弹窗 -->
  <star-horse-dialog
      :dialogVisible="previewVisible"
      :title="i18n('dyform.template.preview')"
      :selfFunc="true"
      @closeAction="closePreviewDialog"
      boxWidth="35%"
  >
    <el-scrollbar max-height="400px">
      <pre class="preview-json">{{ JSON.stringify(previewData, null, 2) }}</pre>
    </el-scrollbar>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.storage-desc {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

.template-list {
  max-height: 400px;
  overflow-y: auto;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }

  &.active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
  }
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.template-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.template-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 12px;
}

.preview-json {
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  padding: 12px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
