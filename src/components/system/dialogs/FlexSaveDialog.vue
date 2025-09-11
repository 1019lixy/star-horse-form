<template>
  <star-horse-dialog
    :dialogVisible="dialogVisible"
    @closeAction="closeDialog"
    :selfFunc="true"
    :boxWidth="'500px'"
    :full-screen="false"
    :title="isEdit ? i18n('system.flex.saveDialog.title.save') : i18n('system.flex.saveDialog.title.saveAs')"
    @merge="handleSave"
  >
    <div class="save-container">
      <el-form
        :model="saveForm"
        :rules="saveRules"
        ref="saveFormRef"
        label-width="100px"
      >
        <el-form-item :label="i18n('system.flex.saveDialog.label.name')" prop="name">
          <el-input
            v-model="saveForm.name"
            :placeholder="i18n('system.flex.saveDialog.placeholder.name')"
            :disabled="isSaving"
          />
        </el-form-item>

        <el-form-item :label="i18n('system.flex.saveDialog.label.description')" prop="description">
          <el-input
            v-model="saveForm.description"
            type="textarea"
            :rows="3"
            :placeholder="i18n('system.flex.saveDialog.placeholder.description')"
            :disabled="isSaving"
          />
        </el-form-item>

        <el-form-item :label="i18n('system.flex.saveDialog.label.saveType')" prop="saveType" v-if="!isEdit">
          <el-radio-group v-model="saveForm.saveType" :disabled="isSaving">
            <el-radio value="new">{{ i18n('system.flex.saveDialog.saveType.new') }}</el-radio>
            <el-radio value="template">{{ i18n('system.flex.saveDialog.saveType.template') }}</el-radio>
            <el-radio value="copy">{{ i18n('system.flex.saveDialog.saveType.copy') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="i18n('system.flex.saveDialog.label.category')" prop="category">
          <el-select
            v-model="saveForm.category"
            :placeholder="i18n('system.flex.saveDialog.placeholder.category')"
            :disabled="isSaving"
            style="width: 100%"
            allowCreate
            filterable
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="i18n('system.flex.saveDialog.label.tags')" prop="tags">
          <el-tag
            v-for="tag in saveForm.tags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="removeTag(tag)"
            style="margin-right: 8px"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            class="ml-1 w-20"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            class="button-new-tag ml-1"
            size="small"
            @click="showInput"
          >
            {{ i18n('system.flex.saveDialog.button.addTag') }}
          </el-button>
        </el-form-item>

        <el-form-item :label="i18n('system.flex.saveDialog.label.permissions')">
          <el-checkbox-group
            v-model="saveForm.permissions"
            :disabled="isSaving"
          >
            <el-checkbox value="public">{{ i18n('system.flex.saveDialog.permission.public') }}</el-checkbox>
            <el-checkbox value="editable">{{ i18n('system.flex.saveDialog.permission.editable') }}</el-checkbox>
            <el-checkbox value="downloadable">{{ i18n('system.flex.saveDialog.permission.downloadable') }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <!-- 设计预览信息 -->
      <div class="design-summary">
        <el-divider content-position="center">{{ i18n('system.flex.saveDialog.title.designInfo') }}</el-divider>
        <el-descriptions :column="2" size="small" border>
          <el-descriptions-item :label="i18n('system.flex.saveDialog.label.itemCount')">
            {{ designSummary.itemCount }}
          </el-descriptions-item>
          <el-descriptions-item :label="i18n('system.flex.saveDialog.label.compCount')">
            {{ designSummary.compCount }}
          </el-descriptions-item>
          <el-descriptions-item :label="i18n('system.flex.saveDialog.label.containerDirection')">
            {{ designSummary.containerDirection }}
          </el-descriptions-item>
          <el-descriptions-item :label="i18n('system.flex.saveDialog.label.createTime')">
            {{ formatDate(new Date().toISOString()) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 快速保存选项 -->
      <div class="quick-save-options" v-if="!isEdit">
        <el-divider content-position="center">{{ i18n('system.flex.saveDialog.title.quickSave') }}</el-divider>
        <div class="quick-actions">
          <el-button
            size="small"
            @click="quickSave('draft')"
            :disabled="isSaving"
          >
            <star-horse-icon icon-class="save" />
            {{ i18n('system.flex.saveDialog.button.saveDraft') }}
          </el-button>
          <el-button
            size="small"
            @click="quickSave('template')"
            :disabled="isSaving"
            type="primary"
          >
            <star-horse-icon icon-class="template" />
            {{ i18n('system.flex.saveDialog.button.quickTemplate') }}
          </el-button>
          <el-button
            size="small"
            @click="quickSave('auto')"
            :disabled="isSaving"
          >
            <star-horse-icon icon-class="auto" />
            {{ i18n('system.flex.saveDialog.button.autoName') }}
          </el-button>
        </div>
      </div>

      <!-- 保存成功提示 -->
      <div v-if="saveResult" class="save-result">
        <el-alert
          :title="i18n('system.flex.saveDialog.title.saveSuccess')"
          type="success"
          :closable="false"
          show-icon
        />
        <div class="result-info">
          <p><strong>{{ i18n('system.flex.saveDialog.label.designId') }}</strong>{{ saveResult.id }}</p>
          <p>
            <strong>{{ i18n('system.flex.saveDialog.label.saveTime') }}</strong>{{ formatDate(saveResult.updatedAt) }}
          </p>
        </div>
        <div class="result-actions">
          <el-button size="small" @click="continueEdit"> {{ i18n('system.flex.saveDialog.button.continueEdit') }} </el-button>
          <el-button size="small" type="primary" @click="viewSaved">
            {{ i18n('system.flex.saveDialog.button.viewSavedDesign') }}
          </el-button>
        </div>
      </div>
    </div>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from "vue";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { saveFlexDesign, type FlexDesignData } from "@/api/flexDesign";
import { piniaInstance, success, error, uuid } from "star-horse-lowcode";
import { i18n } from "@/lang";

interface Props {
  dialogVisible: boolean;
  designName?: string;
  designDescription?: string;
  designId?: string;
  isEdit?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  closeDialog: [];
  saved: [result: FlexDesignData];
}>();

const flexDesign = useFlexDesignStore(piniaInstance);
const saveFormRef = ref();
const InputRef = ref();

const saveForm = reactive({
  name: "",
  description: "",
  saveType: "new" as "new" | "template" | "copy",
  category: "",
  tags: [] as string[],
  permissions: ["public"] as string[],
});

const saveRules = {
  name: [
    { required: true, message: i18n('system.flex.saveDialog.rule.nameRequired'), trigger: "blur" },
    {
      min: 1,
      max: 50,
      message: "名称长度应在 1 到 50 个字符",
      trigger: "blur",
    },
  ],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
};

const categoryOptions = ref([
  { label: "页面布局", value: "layout" },
  { label: "表单设计", value: "form" },
  { label: "数据展示", value: "display" },
  { label: "导航菜单", value: "navigation" },
  { label: "卡片组件", value: "card" },
  { label: "自定义组件", value: "custom" },
]);

const isSaving = ref(false);
const saveResult = ref<FlexDesignData | null>(null);
const inputVisible = ref(false);
const inputValue = ref("");

const designSummary = computed(() => flexDesign.getDesignSummary());

const handleSave = async () => {
  if (!saveFormRef.value) return;

  try {
    await saveFormRef.value.validate();

    isSaving.value = true;

    const designData = flexDesign.serializeDesignData(
      saveForm.name,
      saveForm.description,
    );

    const saveData: FlexDesignData = {
      ...designData,
      id: props.isEdit ? props.designId : undefined,
      category: saveForm.category,
      tags: saveForm.tags,
      permissions: saveForm.permissions,
      saveType: saveForm.saveType,
    } as any;

    const result = await saveFlexDesign(saveData);
    saveResult.value = result;
    emit("saved", result);
  } catch (error) {
    console.error("保存失败:", error);
  } finally {
    isSaving.value = false;
  }
};

const quickSave = async (type: "draft" | "template" | "auto") => {
  try {
    isSaving.value = true;

    let name = "";
    let description = "";
    let category = "";

    switch (type) {
      case "draft":
        name = `草稿_${formatDate(new Date().toISOString(), "short")}`;
        description = "自动保存的草稿";
        category = "draft";
        break;
      case "template":
        name = `模板_${designSummary.value.itemCount}元素`;
        description = `包含${designSummary.value.itemCount}个元素的布局模板`;
        category = "template";
        break;
      case "auto":
        name = `设计_${uuid().substring(0, 8)}`;
        description = "自动生成的设计";
        category = "layout";
        break;
    }

    const designData = flexDesign.serializeDesignData(name, description);
    const saveData: FlexDesignData = {
      ...designData,
      category,
      tags: [type],
      permissions: ["public"],
    };

    const result = await saveFlexDesign(saveData);
    saveResult.value = result;
    emit("saved", result);
  } catch (error) {
    console.error(i18n('system.flex.saveDialog.message.saveError'), error);
  } finally {
    isSaving.value = false;
  }
};

const removeTag = (tag: string) => {
  saveForm.tags.splice(saveForm.tags.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value?.input?.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value && !saveForm.tags.includes(inputValue.value)) {
    saveForm.tags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

const continueEdit = () => {
  emit("closeDialog");
};

const viewSaved = () => {
  if (saveResult.value) {
    success("查看功能开发中...");
    // 这里可以跳转到设计列表或详情页
  }
  emit("closeDialog");
};

const formatDate = (dateString: string, format: "full" | "short" = "full") => {
  const date = new Date(dateString);
  if (format === "short") {
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleString("zh-CN");
};

const closeDialog = () => {
  emit("closeDialog");
};

// 监听dialog显示状态，重置数据
watch(
  () => props.dialogVisible,
  (visible) => {
    if (visible) {
      saveForm.name = props.designName || "";
      saveForm.description = props.designDescription || "";
      saveForm.saveType = "new";
      saveForm.category = "layout";
      saveForm.tags = [];
      saveForm.permissions = ["public"];
      saveResult.value = null;
      isSaving.value = false;
      inputVisible.value = false;
      inputValue.value = "";
    }
  },
);
</script>

<style lang="scss" scoped>
.save-container {
  max-height: 70vh;
  overflow-y: auto;
}

.design-summary {
  margin: 20px 0;
}

.quick-save-options {
  margin: 20px 0;

  .quick-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
}

.save-result {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;

  .result-info {
    margin: 16px 0;

    p {
      margin: 8px 0;
      font-size: 14px;
      color: #666;
    }
  }

  .result-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 16px;
  }
}

.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}

:deep(.el-alert) {
  margin-bottom: 16px;
}
</style>
